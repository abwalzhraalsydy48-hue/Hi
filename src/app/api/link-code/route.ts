import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// GET /api/link-code - List all link codes
export async function GET() {
  try {
    const codes = await db.linkCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: { device: { select: { id: true, name: true } } }
    });

    return NextResponse.json({ ok: true, codes });
  } catch (error) {
    console.error('Error fetching link codes:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch link codes' }, { status: 500 });
  }
}

// POST /api/link-code - Generate a new link code
export async function POST() {
  try {
    // Generate 8-character code
    const code = nanoid(8).toUpperCase();

    const linkCode = await db.linkCode.create({
      data: {
        code,
        sessionId: nanoid(16)
      }
    });

    return NextResponse.json({
      ok: true,
      code: linkCode.code,
      sessionId: linkCode.sessionId
    });
  } catch (error) {
    console.error('Error generating link code:', error);
    return NextResponse.json({ ok: false, error: 'Failed to generate link code' }, { status: 500 });
  }
}
