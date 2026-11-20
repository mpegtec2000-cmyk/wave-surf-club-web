import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// One-way salted scrypt password hashes (never stored in plaintext, never exposed to client)
const STAFF_PASSWORD_HASHES = {
  'wave_surf_club@outlook.com':
    '666c88fb8e62922a19e9ebe527360d4f:20c5ff26c7350a41c6397e025260fecab216be46c1825e099b34fb8b1b7ae88ea00ca5d3b66499e5262f8ad2114df3f98b0ecb56038c02e1d94b35a3b2d562e0',
  'francisco@wavesurf.cl':
    'f5c531f270c43e393fc0119530d0c06e:552b236fad07d5e38441c4e7e430617ae473ec8cb9f9cc56dd2c35b59903fc66fbc1652f27bf32a43821049998f216469b5050222eece48be3ba6eb0ce5d25f1',
  'caja@wavesurf.cl':
    '4b836e8b30077d94fa50cc3496c2494d:15004755fa354e2cdf5ad722151e85a8cc87609615ed658f838e1b6f1724c0997d5606037e7a25776d6f9827b7d2f1e015b22cace1d5098311d3bfe04d5eab2b',
  'asistente@wavesurf.cl':
    'eb61627376f74242dd482aeb04270998:0a713c2c5edf9f7f094247d48602cea38cc23f5743dce7a5afce14fd90f903252775f3430ec9136688271cb061e24cbe29137b7bbc8970b32357a2788e814284',
  'ana@wavesurf.cl':
    '031748e00a75a8369ba7b0eaab36dabb:6002e0a851c6f8be67af2b87f7670cc9f63df0570c7b0b100da7513cefa0c48e817b5136e03507294e8c02f1c5e69c707d00876ef87ff06f9b274a9df8321ff6',
};

// Non-secret fallback metadata used only if Supabase is temporarily unreachable
const FALLBACK_PROFILES = {
  'wave_surf_club@outlook.com': {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'WAVE_SURF_CLUB@outlook.com',
    rut: '11.111.111-1',
    name: 'Matías Wave',
    role: 'superadmin',
    phone: '+56 9 1234 5678',
    allowed_branches: [1, 2, 3],
  },
  'francisco@wavesurf.cl': {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'francisco@wavesurf.cl',
    rut: '19.999.999-9',
    name: 'Francisco Lusiño',
    role: 'superadmin',
    phone: '+56 9 9999 9999',
    allowed_branches: [1, 2, 3],
  },
  'caja@wavesurf.cl': {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'caja@wavesurf.cl',
    rut: '22.222.222-2',
    name: 'Carlos Caja',
    role: 'caja',
    phone: '+56 9 2222 2222',
    allowed_branches: [1, 2],
  },
  'asistente@wavesurf.cl': {
    id: 'a0000000-0000-0000-0000-000000000004',
    email: 'asistente@wavesurf.cl',
    rut: '33.333.333-3',
    name: 'Ana Asistente',
    role: 'asistente',
    phone: '+56 9 3333 3333',
    allowed_branches: [1],
  },
};

function timingSafeTextEqual(a, b) {
  const bufA = Buffer.from(String(a), 'utf8');
  const bufB = Buffer.from(String(b), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyScryptHash(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, expectedHex] = storedHash.split(':');
  const derived = crypto.scryptSync(String(password), salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function verifyEnvCredentials(normalizedEmail, password) {
  const raw = process.env.STAFF_CREDENTIALS_JSON;
  if (!raw) return null; // Not configured
  try {
    const parsed = JSON.parse(raw);
    const map = {};
    for (const [k, v] of Object.entries(parsed)) {
      map[k.trim().toLowerCase()] = String(v);
    }
    if (!(normalizedEmail in map)) return false;
    return timingSafeTextEqual(password, map[normalizedEmail]);
  } catch {
    return null;
  }
}

function createSignedSessionToken(user) {
  const secret =
    process.env.AUTH_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'wsc-erp-session-signing-key';
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 1000 * 60 * 60 * 12, // 12 hours
    }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!rawEmail || !password) {
      return NextResponse.json(
        { error: 'Ingresa tu correo institucional y contraseña.' },
        { status: 400 }
      );
    }

    const normalizedEmail = rawEmail.toLowerCase();

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = sbUrl && sbKey ? createClient(sbUrl, sbKey) : null;

    // 1. Validate password (priority: env var override -> Supabase Auth -> server scrypt hash)
    let authenticated = false;

    const envResult = verifyEnvCredentials(normalizedEmail, password);
    if (envResult === true) {
      authenticated = true;
    }

    if (!authenticated && supabase) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: rawEmail,
          password,
        });
        if (!authErr && authData?.user) {
          authenticated = true;
        }
      } catch {
        // Continue to salted hash check if Supabase Auth is unavailable or user is profile-only
      }
    }

    if (!authenticated && STAFF_PASSWORD_HASHES[normalizedEmail]) {
      authenticated = verifyScryptHash(password, STAFF_PASSWORD_HASHES[normalizedEmail]);
    }

    if (!authenticated) {
      return NextResponse.json(
        { error: 'Credenciales inválidas o acceso denegado.' },
        { status: 401 }
      );
    }

    // 2. Resolve staff profile & allowed branches from Supabase (never exposing secrets)
    let user = null;

    if (supabase) {
      try {
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('id, email, rut, name, role, phone, is_staff, is_active')
          .ilike('email', rawEmail)
          .eq('is_staff', true)
          .limit(1);

        if (!profileErr && profileData && profileData.length > 0) {
          const profile = profileData[0];
          if (profile.is_active === false) {
            return NextResponse.json(
              { error: 'Esta cuenta de colaborador se encuentra desactivada.' },
              { status: 403 }
            );
          }

          const { data: accessData } = await supabase
            .from('staff_branch_access')
            .select('branch_id')
            .eq('profile_id', profile.id);

          user = {
            id: profile.id,
            email: profile.email,
            rut: profile.rut,
            name: profile.name,
            role: profile.role,
            phone: profile.phone,
            allowed_branches:
              Array.isArray(accessData) && accessData.length > 0
                ? accessData.map((a) => a.branch_id)
                : [1, 2, 3],
          };
        }
      } catch {
        // Fallback below if Supabase is temporarily unreachable
      }
    }

    if (!user && FALLBACK_PROFILES[normalizedEmail]) {
      user = { ...FALLBACK_PROFILES[normalizedEmail] };
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o sin permisos de colaborador.' },
        { status: 403 }
      );
    }

    const token = createSignedSessionToken(user);
    const response = NextResponse.json({ user, error: null });

    response.cookies.set('wsc_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'No se pudo procesar el inicio de sesión.' },
      { status: 500 }
    );
  }
}
