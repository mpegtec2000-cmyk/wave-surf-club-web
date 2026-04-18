import { NextResponse } from 'next/server';

export async function POST(request) {
  // Recibimos el POST de Flow con el token
  const body = await request.formData();
  const token = body.get('token');
  
  const url = request.nextUrl.clone();
  url.pathname = '/tienda/pago-exitoso';
  
  // Pasamos el token a la página de éxito. 
  // La página de éxito buscará la orden usando este token.
  if (token) {
    url.searchParams.set('token', token);
  }
  
  return NextResponse.redirect(url, 303);
}

export async function GET(request) {
  // También manejamos GET por si acaso
  const token = request.nextUrl.searchParams.get('token');
  const url = request.nextUrl.clone();
  url.pathname = '/tienda/pago-exitoso';
  if (token) url.searchParams.set('token', token);
  return NextResponse.redirect(url, 303);
}
