import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/events - List events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const level = searchParams.get('level');

    const where: Record<string, unknown> = {};
    if (deviceId) where.deviceId = deviceId;
    if (level) where.level = level;

    const events = await db.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { device: { select: { id: true, name: true } } }
    });

    return NextResponse.json({ ok: true, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch events' }, { status: 500 });
  }
}
