import { NextResponse } from 'next/server';
import { executeQuerySingle } from '@/lib/database-postgresql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email és jelszó kötelező!' },
        { status: 400 }
      );
    }

    // Keressük meg a felhasználót az admin_users táblában
    const user = await executeQuerySingle(`
      SELECT * FROM admin_users 
      WHERE email = $1
    `, [email]);

    // Teszt admin esetén (mielőtt ellenőrizzük az adatbázis felhasználót)
    if (email === 'admin@palace-poker.hu' && password === 'admin123') {
      const token = jwt.sign(
        { 
          id: 999,
          email: 'admin@palace-poker.hu',
          role: 'admin'
        },
        process.env.JWT_SECRET || 'default-secret-key',
        { expiresIn: '24h' }
      );

      return NextResponse.json({
        token,
        user: {
          id: 999,
          username: 'Test Admin',
          email: 'admin@palace-poker.hu',
          role: 'admin'
        }
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Helytelen bejelentkezési adatok' },
        { status: 401 }
      );
    }

    // Jelszó ellenőrzés
    let passwordValid = false;
    if (user.password_hash) {
      // Először próbáljuk egyszerű szöveg összehasonlítást (teszt esetére)
      if (password === user.password_hash) {
        passwordValid = true;
      } else {
        // Ha van hash-elt jelszó, használjuk bcrypt-et
        try {
          passwordValid = await bcrypt.compare(password, user.password_hash);
        } catch (e) {
          passwordValid = false;
        }
      }
    } else if (user.password) {
      // Fallback egyszerű jelszó ellenőrzésre (fejlesztési célokra)
      passwordValid = password === user.password;
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Helytelen bejelentkezési adatok' },
        { status: 401 }
      );
    }

    // JWT token generálás
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role || 'admin'
      },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '24h' }
    );

    const userData = {
      id: user.id,
      username: user.username || user.name,
      email: user.email,
      role: user.role || 'admin'
    };

    return NextResponse.json({
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Bejelentkezési hiba történt' },
      { status: 500 }
    );
  }
}