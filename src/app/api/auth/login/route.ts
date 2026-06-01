import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// POST /api/auth/login - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('[Auth] Login attempt:', { username });

    // Validate input
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'Username and password are required'
      }, { status: 400 });
    }

    // For initial setup, check against environment or default credentials
    // In production, you would check against a database
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === validUsername && password === validPassword) {
      // Create a session token
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Try to create session in database
      try {
        await db.session.create({
          data: {
            token,
            username,
            expiresAt
          }
        });
      } catch (dbError) {
        console.log('[Auth] Session table might not exist, continuing...');
      }

      console.log('[Auth] Login successful for:', username);

      return NextResponse.json({
        success: true,
        token,
        user: {
          username,
          role: 'admin'
        },
        message: 'Login successful'
      });
    }

    console.log('[Auth] Invalid credentials for:', username);

    return NextResponse.json({
      success: false,
      error: 'Invalid username or password'
    }, { status: 401 });

  } catch (error) {
    console.error('[Auth] Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error during login'
    }, { status: 500 });
  }
}

// GET /api/auth/login - Check auth status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false
      });
    }

    // Check session in database
    try {
      const session = await db.session.findUnique({
        where: { token }
      });

      if (session && session.expiresAt > new Date()) {
        return NextResponse.json({
          success: true,
          authenticated: true,
          user: {
            username: session.username,
            role: 'admin'
          }
        });
      }
    } catch (dbError) {
      // Session table might not exist
    }

    return NextResponse.json({
      success: false,
      authenticated: false
    });

  } catch (error) {
    console.error('[Auth] Check error:', error);
    return NextResponse.json({
      success: false,
      authenticated: false
    }, { status: 500 });
  }
}
