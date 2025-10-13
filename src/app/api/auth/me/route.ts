import { NextResponse } from 'next/server';
import { executeQuerySingle } from '@/lib/database-postgresql';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Nincs érvényes token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key') as any;
      
      // Teszt admin esetén
      if (decoded.email === 'admin@palace-poker.hu') {
        return NextResponse.json({
          id: 1,
          username: 'Admin',
          email: 'admin@palace-poker.hu',
          role: 'admin'
        });
      }

      // Keressük meg a felhasználót az adatbázisban
      const user = await executeQuerySingle(`
        SELECT id, username, email 
        FROM admin_users 
        WHERE id = $1
      `, [decoded.id]);

      if (!user) {
        return NextResponse.json(
          { error: 'Felhasználó nem található' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'admin'
      });

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Érvénytelen token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Szerver hiba' },
      { status: 500 }
    );
  }
}