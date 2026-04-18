import { NextResponse } from 'next/server';
import crypto from 'crypto';

const FLOW_API_URL = process.env.FLOW_API_URL || 'https://www.flow.cl/api';
const FLOW_API_KEY = process.env.FLOW_API_KEY || '546AEF54-FFF9-4305-BC63-6E266EL45C7B';
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY || 'd3930102502eb35ae78e943b6b92ff9b95576717';
const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || 'https://wavesurfclub.cl';

function signParams(params, secretKey) {
  const keys = Object.keys(params).sort();
  let toSign = '';
  keys.forEach(key => { toSign += key + params[key]; });
  return crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { productos, cliente, total, reservas, subtotal } = body;

    // Guardar orden en Supabase primero
    const { createClient } = await import('@supabase/supabase-js');
    
    const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oghqbrtfcmrmucqgehkc.supabase.co';
    const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9naHFicnRmY21ybXVjcWdlaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzA2OTksImV4cCI6MjA5MTAwNjY5OX0.30PI9RTwqtxpKDSQdFhB9pExEV-gTnKDztm0mn8B1_A';

    if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
      throw new Error('Configuración de Flow (API_KEY o SECRET) faltante en el servidor.');
    }

    const supabase = createClient(SB_URL, SB_KEY);

    const { data: orden, error } = await supabase
      .from('ordenes_tienda')
      .insert({
        productos: productos,
        reservas: reservas || [],
        subtotal: subtotal,
        comision_flow: total - subtotal,
        total: total,
        estado: 'pendiente',
        email_cliente: cliente.email,
        nombre_cliente: `${cliente.nombre} ${cliente.apellido || ''}`.trim(),
        telefono_cliente: cliente.telefono,
        rut_cliente: cliente.rut
      })
      .select()
      .single();

    if (error) throw error;

    // Crear orden en Flow
    const commerceOrder = orden.id;
    const subject = 'Compra Wave Surf Club';
    const currency = 'CLP';
    const amount = total;
    const email = cliente.email;
    const urlConfirmation = `${NEXT_PUBLIC_URL}/api/flow/confirmar`;
    const urlReturn = `${NEXT_PUBLIC_URL}/api/flow/return`;

    const params = {
      apiKey: FLOW_API_KEY,
      commerceOrder,
      subject,
      currency,
      amount,
      email,
      urlConfirmation,
      urlReturn,
      paymentMethod: 9 // débito
    };

    params.s = signParams(params, FLOW_SECRET_KEY);

    const formData = new URLSearchParams(params);
    const response = await fetch(`${FLOW_API_URL}/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const flowData = await response.json();

    if (flowData.url && flowData.token) {
      // Actualizar orden con token de Flow
      await supabase
        .from('ordenes_tienda')
        .update({ flow_token: flowData.token })
        .eq('id', orden.id);

      // Si hay reservas, crearlas en estado pendiente
      if (reservas && reservas.length > 0) {
        for (const reserva of reservas) {
          await supabase.from('reservas').insert({
            producto_id: reserva.producto_id,
            orden_id: orden.id,
            fecha: reserva.fecha,
            hora_inicio: reserva.hora_inicio,
            hora_fin: reserva.hora_fin,
            estado: 'pendiente',
            notas: `Cliente: ${cliente.nombre} | RUT: ${cliente.rut}`
          });
        }
      }

      return NextResponse.json({
        url: `${flowData.url}?token=${flowData.token}`,
        orden_id: orden.id
      });
    } else {
      throw new Error(flowData.message || 'Error al crear orden en Flow');
    }
  } catch (error) {
    console.error('Error Flow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
