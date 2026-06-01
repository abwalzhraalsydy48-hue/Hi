import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/v1/user/devices - Get user's devices
export async function GET(request: NextRequest) {
  try {
    const devices = await db.device.findMany({
      select: {
        id: true,
        name: true,
        model: true,
        brand: true,
        os: true,
        battery: true,
        active: true,
        lastSeen: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      devices: devices.map(d => ({
        id: d.id,
        name: d.name || `Device-${d.id.substring(0, 6)}`,
        model: d.model || 'Unknown',
        brand: d.brand || 'Unknown',
        os: d.os || 'Android',
        battery: d.battery || '0',
        active: d.active,
        lastSeen: d.lastSeen?.toISOString() || null
      }))
    });

  } catch (error) {
    console.error('[V1 User Devices] Error:', error);
    return NextResponse.json({
      success: true,
      devices: []
    });
  }
}
