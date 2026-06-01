import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/v1/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const devices = await db.device.findMany({
      select: { id: true, active: true }
    });

    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.active).length;

    return NextResponse.json({
      success: true,
      stats: {
        total_devices: totalDevices,
        online_devices: onlineDevices,
        total_commands: 0,
        pending_commands: 0
      }
    });

  } catch (error) {
    console.error('[V1 Stats] Error:', error);
    return NextResponse.json({
      success: true,
      stats: {
        total_devices: 0,
        online_devices: 0,
        total_commands: 0,
        pending_commands: 0
      }
    });
  }
}
