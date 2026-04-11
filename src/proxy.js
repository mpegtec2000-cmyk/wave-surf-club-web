import { NextResponse } from 'next/server';

// Next.js 16 Proxy (Middleware)
export default function proxy(request) {
  const { pathname } = request.nextUrl;

  // Solo protegemos rutas de dashboard
  if (pathname.startsWith('/dashboard')) {
    // Aquí normalmente verificaríamos el token de sesión
    // const session = request.cookies.get('wave_user');
    // if (!session) return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
