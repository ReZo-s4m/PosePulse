import { NextResponse } from 'next/server';
import prisma from '../../db';
import crypto from 'crypto';

function verifyPassword(password: string, hash: string) {
  const [salt, key] = hash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return key === derivedKey.toString('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Email and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ ok: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ ok: false, error: 'Invalid email or password' }, { status: 401 });
    }

    return NextResponse.json({ 
      ok: true, 
      data: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
      } 
    }, { status: 200 });
  } catch (err) {
    console.error('Sign-in error', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
