import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/v1/device/[id]/heartbeat - Device heartbeat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deviceId } = await params;

    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }

    // Find the device
    const device = await db.device.findUnique({
      where: { id: deviceId }
    });

    if (!device) {
      // Create device if not exists
      await db.device.create({
        data: {
          id: deviceId,
          name: `Device-${deviceId.substring(0, 6)}`,
          active: true,
          lastSeen: new Date()
        }
      });
    } else {
      // Update last seen
      await db.device.update({
        where: { id: deviceId },
        data: {
          active: true,
          lastSeen: new Date()
        }
      });
    }

    // Create or update session
    const existingSession = await db.deviceSession.findFirst({
      where: { deviceId, disconnectedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    if (existingSession) {
      await db.deviceSession.update({
        where: { id: existingSession.id },
        data: {
          lastHeartbeat: new Date(),
          uptimeSeconds: existingSession.uptimeSeconds + 30
        }
      });
    } else {
      await db.deviceSession.create({
        data: {
          deviceId,
          lastHeartbeat: new Date(),
          connectedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Heartbeat] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Heartbeat failed'
    }, { status: 500 });
  }
}
