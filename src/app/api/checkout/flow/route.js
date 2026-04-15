import { NextResponse } from 'next/server';
import FlowApi from 'flow-api-client';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { amount, items } = await req.json();

    // Obtener credenciales dinámicas de la DB
    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['flow_api_key', 'flow_secret_key', 'flow_url']);

    const dbConfig = {};
    settings?.forEach(s => {
      if (s.key === 'flow_api_key') dbConfig.apiKey = s.value;
      if (s.key === 'flow_secret_key') dbConfig.secretKey = s.value;
      if (s.key === 'flow_url') dbConfig.baseUrl = s.value;
    });

    // Configuración de Flow (Prioridad DB, luego ENV)
    const flowConfig = {
      apiKey: dbConfig.apiKey || process.env.FLOW_API_KEY,
      secretKey: dbConfig.secretKey || process.env.FLOW_SECRET_KEY,
      baseUrl: dbConfig.baseUrl || process.env.FLOW_URL || 'https://sandbox.flow.cl/api'
    };

    const flow = new FlowApi(flowConfig);

    const orderId = `WS-${Date.now().toString().slice(-6)}`;
    
    // Crear la orden en Flow
    const params = {
      commerceOrder: orderId,
      subject: "Pago Clases Wave Surf Club",
      currency: "CLP",
      amount: amount,
      email: items[0]?.metadata?.email || "cliente@wavesurf.cl",
      urlConfirmation: `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/flow/confirm`,
      urlReturn: `${process.env.NEXT_PUBLIC_BASE_URL}/cart?status=success`,
      timeout: 3600
    };

    const serviceName = "payment/create";
    const response = await flow.send(serviceName, params, "POST");

    if (response.url && response.token) {
      return NextResponse.json({ 
        url: `${response.url}?token=${response.token}`,
        orderId: orderId 
      });
    }

    return NextResponse.json({ error: "Error creating payment" }, { status: 500 });
  } catch (error) {
    console.error("Flow API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
