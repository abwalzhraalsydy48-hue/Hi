import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/v1/device/[id]/info - Update device information
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deviceId } = await params;
    const body = await request.json();

    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 });
    }

    // Extract device info
    const {
      name,
      model,
      brand,
      os,
      androidVersion,
      battery,
      batteryStatus,
      network,
      networkType,
      wifiConnected,
      mobileData,
      location,
      storageAvailable,
      storageTotal
    } = body;

    // Build update data
    const updateData: Record<string, unknown> = {
      lastSeen: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (model !== undefined) updateData.model = model;
    if (brand !== undefined) updateData.brand = brand;
    if (os !== undefined) updateData.os = os;
    if (androidVersion !== undefined) updateData.androidVersion = androidVersion;
    if (battery !== undefined) updateData.battery = battery;
    if (batteryStatus !== undefined) updateData.batteryStatus = batteryStatus;
    if (network !== undefined) updateData.network = network;
    if (networkType !== undefined) updateData.networkType = networkType;
    if (wifiConnected !== undefined) updateData.wifiConnected = wifiConnected;
    if (mobileData !== undefined) updateData.mobileData = mobileData;
    if (location !== undefined) updateData.location = location;
    if (storageAvailable !== undefined) updateData.storageAvailable = storageAvailable;
    if (storageTotal !== undefined) updateData.storageTotal = storageTotal;

    // Find or create device
    const existingDevice = await db.device.findUnique({
      where: { id: deviceId }
    });

    if (existingDevice) {
      await db.device.update({
        where: { id: deviceId },
        data: updateData
      });
    } else {
      await db.device.create({
        data: {
          id: deviceId,
          name: name || `Device-${deviceId.substring(0, 6)}`,
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
          storageAvailable: storageAvailable || null,
          storageTotal: storageTotal || null,
          active: true,
          state: 'online',
          lastSeen: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Device info updated'
    });

  } catch (error) {
    console.error('[Device Info] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update device info'
    }, { status: 500 });
  }
}
