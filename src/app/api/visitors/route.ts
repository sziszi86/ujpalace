import { NextResponse } from 'next/server';
import { executeQuery, executeUpdate } from '@/lib/database-postgresql';
import { headers } from 'next/headers';

export async function POST() {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const xForwardedFor = headersList.get('x-forwarded-for');
    const xRealIp = headersList.get('x-real-ip');
    
    // Get visitor IP
    let visitorIp = 'unknown';
    if (xForwardedFor) {
      visitorIp = xForwardedFor.split(',')[0].trim();
    } else if (xRealIp) {
      visitorIp = xRealIp;
    }

    // Create visitor session with 5-minute timeout
    const visitorId = `${visitorIp}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // First, check if table exists, if not create it
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS active_visitors (
          id SERIAL PRIMARY KEY,
          visitor_id VARCHAR(255) UNIQUE NOT NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create index if it doesn't exist
      await executeQuery(`
        CREATE INDEX IF NOT EXISTS idx_active_visitors_expires_at ON active_visitors(expires_at)
      `);
    } catch (error) {
      console.warn('Table might already exist:', error);
    }

    // Clean up expired visitors
    await executeUpdate(`
      DELETE FROM active_visitors 
      WHERE expires_at < CURRENT_TIMESTAMP
    `);

    // Insert or update visitor
    await executeQuery(`
      INSERT INTO active_visitors (visitor_id, ip_address, user_agent, expires_at, last_seen)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (visitor_id) 
      DO UPDATE SET 
        expires_at = $4,
        last_seen = CURRENT_TIMESTAMP
    `, [visitorId, visitorIp, userAgent, expiresAt]);

    // Get current visitor count
    const [countResult] = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM active_visitors 
      WHERE expires_at > CURRENT_TIMESTAMP
    `);

    return NextResponse.json({ 
      visitorId,
      currentVisitors: parseInt(countResult?.count || '0')
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json(
      { error: 'Failed to track visitor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Clean up expired visitors first
    await executeUpdate(`
      DELETE FROM active_visitors 
      WHERE expires_at < CURRENT_TIMESTAMP
    `);

    // Get current visitor count
    const [countResult] = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM active_visitors 
      WHERE expires_at > CURRENT_TIMESTAMP
    `);

    return NextResponse.json({ 
      currentVisitors: parseInt(countResult?.count || '0')
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Error getting visitor count:', error);
    return NextResponse.json(
      { currentVisitors: 0 },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

export async function PUT() {
  try {
    const headersList = await headers();
    const xForwardedFor = headersList.get('x-forwarded-for');
    const xRealIp = headersList.get('x-real-ip');
    
    // Get visitor IP
    let visitorIp = 'unknown';
    if (xForwardedFor) {
      visitorIp = xForwardedFor.split(',')[0].trim();
    } else if (xRealIp) {
      visitorIp = xRealIp;
    }

    // Update existing visitor session
    const visitorId = `${visitorIp}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Extend by 5 minutes

    await executeUpdate(`
      UPDATE active_visitors 
      SET expires_at = $1, last_seen = CURRENT_TIMESTAMP
      WHERE ip_address = $2 AND expires_at > CURRENT_TIMESTAMP
    `, [expiresAt, visitorIp]);

    // Get current visitor count
    const [countResult] = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM active_visitors 
      WHERE expires_at > CURRENT_TIMESTAMP
    `);

    return NextResponse.json({ 
      currentVisitors: parseInt(countResult?.count || '0')
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Error updating visitor:', error);
    return NextResponse.json(
      { error: 'Failed to update visitor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}