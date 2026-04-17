import { NextResponse } from 'next/server';
import FlowApi from 'flow-api-client';
import { supabase } from '@/lib/supabase';
import { queueNotification } from '@/lib/data';

export async function POST(request) {
  try {
    // Flow envía los datos como form-data (usualmente)
    const formData = await request.formData();
    const token = formData.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token faltante' }, { status: 400 });
    }

    const flow = new FlowApi({
      apiKey: process.env.FLOW_API_KEY,
      secretKey: process.env.FLOW_SECRET_KEY,
      baseUrl: process.env.FLOW_URL || 'https://sandbox.flow.cl/api'
    });

    // Consultar el estado del pago
    const result = await flow.payment.getStatus({ token });

    if (result.status === 2) { // 2 = Pagado exitosamente
      console.log('Pago de Flow CONFIRMADO:', result);

      // El campo result.optional usualmente contiene lo que enviamos al crear
      const optionalData = JSON.parse(result.optional || '{}');
      const { items, customerMetadata, orderId } = optionalData;

      // Registrar en Supabase cada item pagado
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const { error: dbError } = await supabase.from('transactions').insert({
            rental_details: `PAGO CONFIRMADO FLOW: ${item.name}`,
            total: item.price,
            type: 'ingreso',
            category: item.name.includes('CLASE') ? 'clase' : 'otro',
            method: 'debito', // O el que venga en el result
            client_rut: customerMetadata?.rut || 'PAGO_FLOW',
            payment_status: 'pagado',
            is_web_tx: true,
            web_metadata: { 
              ...customerMetadata, 
              flow_token: token, 
              order_id: orderId,
              flow_order: result.flowOrder 
            }
          });

          if (dbError) console.error('Error insertando en DB:', dbError);
        }
      }

      // Notificar al staff
      await queueNotification(
        'web_payment_confirmed',
        'mpeg.logistica@gmail.com',
        `VENTA WEB FLOW CONFIRMADA: ${orderId}`,
        `Monto: $${result.amount}\nOrden Flow: ${result.flowOrder}\nCliente: ${result.payer}`
      );

      return NextResponse.json({ status: 'OK' });
    } else {
      console.log('Pago de Flow NO confirmado / Pendiente. Status:', result.status);
      return NextResponse.json({ status: 'PENDING' });
    }

  } catch (error) {
    console.error("Error en confirmación de Flow:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
