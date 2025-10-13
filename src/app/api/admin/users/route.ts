import { NextResponse } from 'next/server';
import { executeQuery, executeInsert, executeUpdate } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const users = await executeQuery(`
      SELECT id, username, email, created_at, updated_at
      FROM admin_users
      ORDER BY created_at DESC
    `);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Hiba a felhasználók betöltésekor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Felhasználónév, email és jelszó kötelező!' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await executeQuery(`
      SELECT id FROM admin_users WHERE username = $1 OR email = $1
    `, [username, email]);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Felhasználó már létezik ezzel a névvel vagy email címmel!' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await executeInsert(`
      INSERT INTO admin_users (username, email, password_hash)
      VALUES (?, ?, ?)
    `, [username, email, passwordHash]);

    return NextResponse.json({
      id: result.insertId,
      message: 'Felhasználó sikeresen létrehozva!'
    });

  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Hiba a felhasználó létrehozásakor' },
      { status: 500 }
    );
  }
}