import jwt from 'jsonwebtoken';
import { executeQuerySingle } from '@/lib/database-postgresql';

interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export async function verifyAuth(request: Request): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Nincs érvényes token'
      };
    }

    const token = authHeader.substring(7);
    
    try {
      const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'palace-poker-secret-key-2025';
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Test admin esetén
      if (decoded.email === 'admin@palace-poker.hu') {
        return {
          success: true,
          user: {
            id: 999,
            username: 'Test Admin',
            email: 'admin@palace-poker.hu',
            role: 'admin'
          }
        };
      }

      // Keressük meg a felhasználót az adatbázisban
      const user = await executeQuerySingle(`
        SELECT id, username, email 
        FROM admin_users 
        WHERE id = $1
      `, [decoded.id]);

      if (!user) {
        return {
          success: false,
          error: 'Felhasználó nem található'
        };
      }

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: 'admin'
        }
      };

    } catch (jwtError) {
      return {
        success: false,
        error: 'Érvénytelen token'
      };
    }

  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      success: false,
      error: 'Szerver hiba'
    };
  }
}