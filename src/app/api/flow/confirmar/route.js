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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Consultar estado del pago en Flow
    const params = { apiKey: process.env.FLOW_API_KEY, token };
    params.s = signParams(params, process.env.FLOW_SECRET_KEY);

    const response = await fetch(
      `${process.env.FLOW_API_URL || 'https://www.flow.cl/api'}/payment/getStatus?${new URLSearchParams(params)}`
    );
    const flowData = await response.json();

    const nuevoEstado = flowData.status === 2 ? 'pagado' : 'fallido';

    // Actualizar orden
    await supabase
      .from('ordenes_tienda')
      .update({ estado: nuevoEstado, flow_order_id: flowData.flowOrder })
      .eq('flow_token', token);

    // Si pagado, confirmar reservas
    if (nuevoEstado === 'pagado') {
      const { data: orden } = await supabase
        .from('ordenes_tienda')
        .select('id')
        .eq('flow_token', token)
        .single();

      if (orden) {
        await supabase
          .from('reservas')
          .update({ estado: 'confirmada' })
          .eq('orden_id', orden.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error confirmación Flow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
