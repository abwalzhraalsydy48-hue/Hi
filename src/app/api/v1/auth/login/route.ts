import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// POST /api/v1/auth/login - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('[V1 Auth] Login attempt:', { username });

    // Validate input
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'Username and password are required'
      }, { status: 400 });
    }

    // Check credentials
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === validUsername && password === validPassword) {
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      try {
        await db.session.create({
          data: { token, username, expiresAt }
        });
      } catch (dbError) {
        console.log('[V1 Auth] Session table might not exist, continuing...');
      }

      console.log('[V1 Auth] Login successful for:', username);

      return NextResponse.json({
        success: true,
        token,
        user: { username, role: 'admin' },
        message: 'Login successful'
      });
    }

    console.log('[V1 Auth] Invalid credentials for:', username);

    return NextResponse.json({
      success: false,
      error: 'Invalid username or password'
    }, { status: 401 });

  } catch (error) {
    console.error('[V1 Auth] Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error during login'
    }, { status: 500 });
  }
}
