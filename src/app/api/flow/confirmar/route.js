import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function signParams(params, secretKey) {
  const keys = Object.keys(params).sort();
  let toSign = '';
  keys.forEach(key => { toSign += key + params[key]; });
  return crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
}

export async function POST(request) {
  const body = await request.formData();
  const token = body.get('token');

  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oghqbrtfcmrmucqgehkc.supabase.co';
  const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9naHFicnRmY21ybXVjcWdlaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzA2OTksImV4cCI6MjA5MTAwNjY5OX0.30PI9RTwqtxpKDSQdFhB9pExEV-gTnKDztm0mn8B1_A';

  const supabase = createClient(SB_URL, SB_KEY);

  const FLOW_API_URL = process.env.FLOW_API_URL || 'https://www.flow.cl/api';
  const FLOW_API_KEY = process.env.FLOW_API_KEY || '546AEF54-FFF9-4305-BC63-6E266EL45C7B';
  const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY || 'd3930102502eb35ae78e943b6b92ff9b95576717';

  try {
    // Consultar estado del pago en Flow
    const params = { apiKey: FLOW_API_KEY, token };
    params.s = signParams(params, FLOW_SECRET_KEY);

    const response = await fetch(
      `${FLOW_API_URL}/payment/getStatus?${new URLSearchParams(params)}`
    );
    const flowData = await response.json();

    // Flow status 2 = pagado
    const nuevoEstado = flowData.status === 2 ? 'pagado' : 'fallido';

    // Actualizar orden en ordenes_tienda
    const { data: ordenActualizada } = await supabase
      .from('ordenes_tienda')
      .update({ estado: nuevoEstado, flow_order_id: flowData.flowOrder })
      .eq('flow_token', token)
      .select()
      .single();

    if (nuevoEstado === 'pagado' && ordenActualizada) {
      // 1. Confirmar reservas relacionadas
      await supabase
        .from('reservas')
        .update({ estado: 'confirmada' })
        .eq('orden_id', ordenActualizada.id);

      // Obtener detalles de reservas para el email
      const { data: reservasDetalle } = await supabase
        .from('reservas')
        .select('*, productos_tienda(nombre)')
        .eq('orden_id', ordenActualizada.id);

      // 2. Sincronizar con la tabla 'transactions' para que aparezca en el ERP
      const productsNames = Array.isArray(ordenActualizada.productos) 
        ? ordenActualizada.productos.map(p => p.nombre).join(', ')
        : 'Productos varios';
      
      const cleanRut = (ordenActualizada.rut_cliente || '').replace(/\./g, '').replace('-', '').toUpperCase();

      await supabase.from('transactions').insert({
        branch_id: 2, // Concón por defecto para ventas web
        type: 'ingreso',
        category: 'clase', // Usamos clase para que aparezca en el filtro del ERP
        method: 'debito',
        total: ordenActualizada.total,
        client_rut: cleanRut,
        payment_status: 'pagado',
        gateway_tx_id: String(flowData.flowOrder || ''),
        is_web_tx: true,
        rental_details: `COMPRA TIENDA: ${productsNames}`,
        web_metadata: {
          order_id: ordenActualizada.id,
          email: ordenActualizada.email_cliente,
          nombre: ordenActualizada.nombre_cliente,
          productos: ordenActualizada.productos,
          flow_data: flowData
        }
      });

      // 3. Enviar notificación por email al cliente (vía app_notifications)
      const orderShortId = ordenActualizada.id.split('-')[0].toUpperCase();
      
      let emailHtml = `
        <div style="font-family: sans-serif; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #38bdf8; text-align: center;">¡PAGO CONFIRMADO!</h2>
          <p>Hola <strong>${ordenActualizada.nombre_cliente}</strong>,</p>
          <p>Tu compra en <strong>Wave Surf Club</strong> ha sido procesada con éxito.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Número de Orden:</p>
            <h3 style="margin: 5px 0; color: #000; letter-spacing: 2px;">#${orderShortId}</h3>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #eee;">
                <th style="text-align: left; padding: 10px 0;">Producto</th>
                <th style="text-align: right; padding: 10px 0;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${(ordenActualizada.productos || []).map(p => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0;">${p.nombre}</td>
                  <td style="text-align: right; padding: 10px 0;">$${(p.precio_final || 0).toLocaleString('es-CL')}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 15px 0; font-weight: bold;">TOTAL</td>
                <td style="text-align: right; padding: 15px 0; font-weight: bold; font-size: 18px; color: #38bdf8;">
                  $${(ordenActualizada.total || 0).toLocaleString('es-CL')}
                </td>
              </tr>
            </tfoot>
          </table>

          ${reservasDetalle && reservasDetalle.length > 0 ? `
            <div style="margin-top: 30px; border-top: 2px solid #38bdf8; padding-top: 20px;">
              <h3 style="margin-bottom: 15px;">📅 Tus Reservas (Sede Concón)</h3>
              ${reservasDetalle.map(r => `
                <div style="background: #eff6ff; border-left: 4px solid #38bdf8; padding: 12px; margin-bottom: 10px;">
                  <strong style="display: block; margin-bottom: 4px;">${r.productos_tienda?.nombre || 'Servicio'}</strong>
                  <span style="font-size: 14px; color: #4b5563;">
                    Fecha: ${r.fecha.split('-').reverse().join('-')}<br>
                    Hora: ${r.hora_inicio.substring(0,5)} - ${r.hora_fin.substring(0,5)}
                  </span>
                </div>
              `).join('')}
              <p style="font-size: 13px; color: #6b7280; font-style: italic; margin-top: 10px;">
                * Por favor llega 15 minutos antes de tu hora agendada.
              </p>
            </div>
          ` : ''}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center;">
            <p>Si tienes alguna duda, responde a este correo o contáctanos a contacto@wavesurf.cl</p>
            <p><strong>WAVE SURF CLUB - Concón, Chile</strong></p>
          </div>
        </div>
      `;

      await supabase.from('app_notifications').insert({
        type: 'email',
        recipient: ordenActualizada.email_cliente,
        subject: `Confirmación de Compra #${orderShortId} - Wave Surf Club`,
        content: emailHtml,
        status: 'pending'
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error confirmación Flow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
