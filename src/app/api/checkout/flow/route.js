import { NextResponse } from 'next/server';
import FlowApi from 'flow-api-client';

export async function POST(request) {
  try {
    const { amount, email, subject, items, metadata } = await request.json();

    // Validar parámetros mínimos
    if (!amount || !email) {
      return NextResponse.json({ error: 'Monto y email son requeridos' }, { status: 400 });
    }

    const flow = new FlowApi({
      apiKey: process.env.FLOW_API_KEY,
      secretKey: process.env.FLOW_SECRET_KEY,
      baseUrl: process.env.FLOW_URL || 'https://sandbox.flow.cl/api'
    });

    const commerceOrder = "WS-" + Date.now().toString().slice(-6);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wave-surf-club-web.vercel.app';

    const params = {
      commerceOrder: commerceOrder,
      subject: subject || "Compra en Wave Surf Club",
      amount: amount,
      email: email,
      urlConfirmation: `${baseUrl}/api/checkout/flow/confirm`,
      urlReturn: `${baseUrl}/checkout/success?orderId=${commerceOrder}`,
      // Pasamos metadata como un string JSON si es necesario rastrearlo en la confirmación
      optional: JSON.stringify({ 
        orderId: commerceOrder,
        items: items,
        customerMetadata: metadata 
      })
    };

    console.log('Iniciando pago en Flow:', params);
    
    // Crear el pago en Flow
    const response = await flow.payment.create(params);
    
    // Devolvemos la URL y el token para que el frontend redirija
    // La respuesta de flow.payment.create retorna { url, token, flowOrder }
    return NextResponse.json({ 
      url: `${response.url}?token=${response.token}`,
      orderId: commerceOrder 
    });
    
  } catch (error) {
    console.error("Error al conectar con Flow:", error);
    return NextResponse.json({ 
      error: 'Error al iniciar el pago con Flow', 
      details: error.message 
    }, { status: 500 });
  }
}
