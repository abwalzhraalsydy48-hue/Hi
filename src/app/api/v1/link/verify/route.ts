import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// POST /api/v1/link/verify - Verify a link code from target device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Link code is required'
      }, { status: 400 });
    }

    // Normalize the code (uppercase, trim)
    const normalizedCode = code.trim().toUpperCase();

    console.log(`[Link Verify] Verifying code: ${normalizedCode}`);

    // Find the link code in database
    const linkCode = await db.linkCode.findUnique({
      where: { code: normalizedCode },
      include: { device: true }
    });

    if (!linkCode) {
      console.log(`[Link Verify] Code not found: ${normalizedCode}`);
      return NextResponse.json({
        success: false,
        error: 'Invalid link code - not found'
      }, { status: 404 });
    }

    // Check if code is already used
    if (linkCode.used) {
      console.log(`[Link Verify] Code already used: ${normalizedCode}`);
      return NextResponse.json({
        success: false,
        error: 'Link code already used'
      }, { status: 400 });
    }

    // Generate device ID
    const deviceId = nanoid(16);

    // Create a new device linked to this code
    const device = await db.device.create({
      data: {
        id: deviceId,
        name: `Device-${deviceId.substring(0, 6)}`,
        active: true,
        lastSeen: new Date(),
        linkCodeId: linkCode.id
      }
    });

    // Mark the link code as used
    await db.linkCode.update({
      where: { id: linkCode.id },
      data: {
        used: true,
        usedAt: new Date(),
        deviceId: device.id
      }
    });

    console.log(`[Link Verify] Device created: ${deviceId} for code: ${normalizedCode}`);

    // Create event for logging
    await db.event.create({
      data: {
        deviceId: device.id,
        event: 'device_linked',
        details: `Device linked with code ${normalizedCode}`,
        level: 'info'
      }
    });

    return NextResponse.json({
      success: true,
      device_id: device.id,
      message: 'Device linked successfully'
    });

  } catch (error) {
    console.error('[Link Verify] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error during verification'
    }, { status: 500 });
  }
}
