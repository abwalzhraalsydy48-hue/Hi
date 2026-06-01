import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// POST /api/v1/link-code - Generate a new link code
export async function POST(request: NextRequest) {
  try {
    const code = nanoid(8).toUpperCase();

    const linkCode = await db.linkCode.create({
      data: {
        code,
        sessionId: nanoid(16)
      }
    });

    console.log('[V1 Link Code] Generated:', linkCode.code);

    return NextResponse.json({
      success: true,
      code: linkCode.code,
      sessionId: linkCode.sessionId
    });

  } catch (error) {
    console.error('[V1 Link Code] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate link code'
    }, { status: 500 });
  }
}

// GET /api/v1/link-code - List all link codes
export async function GET(request: NextRequest) {
  try {
    const codes = await db.linkCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: { device: { select: { id: true, name: true } } }
    });

    return NextResponse.json({
      success: true,
      codes
    });

  } catch (error) {
    console.error('[V1 Link Code] Error:', error);
    return NextResponse.json({
      success: true,
      codes: []
    });
  }
}
