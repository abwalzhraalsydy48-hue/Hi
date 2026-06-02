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
        batteryStatus: true,
        network: true,
        networkType: true,
        wifiConnected: true,
        mobileData: true,
        active: true,
        state: true,
        location: true,
        lastSeen: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const ONLINE_THRESHOLD_MS = 60 * 1000; // 60 seconds

    return NextResponse.json({
      success: true,
      devices: devices.map(d => {
        // Calculate if device is online based on lastSeen
        const lastSeenDate = d.lastSeen ? new Date(d.lastSeen) : null;
        const isOnline = lastSeenDate && (now.getTime() - lastSeenDate.getTime()) < ONLINE_THRESHOLD_MS;
        
        return {
          id: d.id,
          name: d.name || `Device-${d.id.substring(0, 6)}`,
          model: d.model || 'Unknown',
          brand: d.brand || 'Unknown',
          os: d.os || 'Android',
          battery: d.battery || '0',
          batteryStatus: d.batteryStatus || null,
          network: d.network || null,
          networkType: d.networkType || null,
          wifiConnected: d.wifiConnected || false,
          mobileData: d.mobileData || false,
          location: d.location || null,
          active: isOnline, // Use calculated online status
          state: isOnline ? 'online' : 'offline',
          lastSeen: d.lastSeen?.toISOString() || null,
          createdAt: d.createdAt?.toISOString() || null
        };
      })
    });

  } catch (error) {
    console.error('[V1 User Devices] Error:', error);
    return NextResponse.json({
      success: true,
      devices: []
    });
  }
}
