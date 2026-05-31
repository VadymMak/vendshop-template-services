import { NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_token';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  let email = '';
  let password = '';
  try {
    const body = await request.json();
    email = typeof body?.email === 'string' ? body.email : '';
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Невірний email або пароль' }, { status: 401 });
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@electromarket.ua';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/',
    });
    return res;
  }

  return NextResponse.json({ error: 'Невірний email або пароль' }, { status: 401 });
}
