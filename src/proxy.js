import { NextResponse } from 'next/server';

function hasValidSessionCookie(request) {
  const token = request.cookies.get('wsc_session')?.value;
  if (!token || !token.includes('.')) return false;
  try {
    const [payloadB64] = token.split('.');
    const padded = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded);
    const data = JSON.parse(json);
    return Boolean(data?.sub && data?.role && (!data.exp || data.exp > Date.now()));
  } catch {
    return false;
  }
}

// Next.js 16 Proxy (Middleware)
export default function proxy(request) {
  const { pathname } = request.nextUrl;

  // Protegemos rutas del panel interno ERP
  if (pathname.startsWith('/dashboard')) {
    if (!hasValidSessionCookie(request)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
