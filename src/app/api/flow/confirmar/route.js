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
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error confirmación Flow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
