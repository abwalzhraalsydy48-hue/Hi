import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/v1/device/[id]/heartbeat - Device heartbeat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deviceId } = await params;
    const body = await request.json().catch(() => ({}));

    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }

    // Extract device info from heartbeat
    const {
      battery,
      batteryStatus,
      network,
      networkType,
      wifiConnected,
      mobileData,
      model,
      brand,
      os,
      androidVersion,
      location
    } = body;

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
          model: model || null,
          brand: brand || null,
          os: os || null,
          androidVersion: androidVersion || null,
          battery: battery || null,
          batteryStatus: batteryStatus || null,
          network: network || null,
          networkType: networkType || null,
          wifiConnected: wifiConnected || false,
          mobileData: mobileData || false,
          location: location || null,
          active: true,
          state: 'online',
          lastSeen: new Date()
        }
      });
    } else {
      // Update device with new info
      const updateData: Record<string, unknown> = {
        active: true,
        state: 'online',
        lastSeen: new Date()
      };

      // Only update if provided
      if (battery !== undefined) updateData.battery = battery;
      if (batteryStatus !== undefined) updateData.batteryStatus = batteryStatus;
      if (network !== undefined) updateData.network = network;
      if (networkType !== undefined) updateData.networkType = networkType;
      if (wifiConnected !== undefined) updateData.wifiConnected = wifiConnected;
      if (mobileData !== undefined) updateData.mobileData = mobileData;
      if (model !== undefined) updateData.model = model;
      if (brand !== undefined) updateData.brand = brand;
      if (os !== undefined) updateData.os = os;
      if (androidVersion !== undefined) updateData.androidVersion = androidVersion;
      if (location !== undefined) updateData.location = location;

      await db.device.update({
        where: { id: deviceId },
        data: updateData
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
