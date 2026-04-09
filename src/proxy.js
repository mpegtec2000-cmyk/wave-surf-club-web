import { NextResponse } from 'next/server';

// Este middleware simula la protección de rutas basada en cookies/sesión de Supabase
// En una implementación real, usaríamos supabase.auth.getUser()
export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Solo protegemos rutas de dashboard
  if (pathname.startsWith('/dashboard')) {
    // Aquí normalmente verificaríamos el token de sesión
    // Por ahora, dejamos que el cliente maneje la redirección si no hay `wave_user` en localStorage
    // Pero si quisiéramos proteger a nivel de servidor:
    // const session = request.cookies.get('supabase-auth-token');
    // if (!session) return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
