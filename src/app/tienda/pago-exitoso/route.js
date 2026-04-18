import { NextResponse } from 'next/server';

export async function POST(request) {
  // Flow a veces envía un POST al urlReturn. 
  // Redirigimos a GET para que Next.js lo maneje correctamente en page.js
  const body = await request.formData();
  const token = body.get('token');
  
  // Obtenemos la URL base (Next.js 15+ compatible)
  const url = request.nextUrl.clone();
  url.pathname = '/tienda/pago-exitoso';
  // Si Flow envía el token, lo pasamos como query param
  if (token) url.searchParams.set('token', token);
  
  return NextResponse.redirect(url, 303);
}
