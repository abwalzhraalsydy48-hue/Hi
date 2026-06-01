import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/auth/logout - Admin logout
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      // Try to delete session from database
      try {
        await db.session.deleteMany({
          where: { token }
        });
      } catch (dbError) {
        // Session table might not exist
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('[Auth] Logout error:', error);
    return NextResponse.json({
      success: true,
      message: 'Logged out'
    });
  }
}
