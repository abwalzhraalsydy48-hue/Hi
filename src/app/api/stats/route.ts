import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTotalCommands } from '@/lib/commands';

// GET /api/stats - Get server statistics
export async function GET() {
  try {
    const devices = await db.device.findMany();
    const commands = await db.command.findMany();
    const events = await db.event.count();

    const now = new Date();
    const ONLINE_THRESHOLD_MS = 60 * 1000; // 60 seconds
    
    const onlineDevices = devices.filter(d => {
      if (!d.lastSeen) return false;
      const diff = now.getTime() - new Date(d.lastSeen).getTime();
      return diff < ONLINE_THRESHOLD_MS;
    });

    // Count commands by status (support both old and new status names)
    const pendingCommands = commands.filter(c => 
      c.status === 'pending' || c.status === 'queued' || c.status === 'delivered'
    ).length;
    
    const completedCommands = commands.filter(c => 
      c.status === 'completed' || c.status === 'success'
    ).length;
    
    const failedCommands = commands.filter(c => 
      c.status === 'failed' || c.status === 'timeout'
    ).length;

    return NextResponse.json({
      ok: true,
      stats: {
        devicesTotal: devices.length,
        devicesOnline: onlineDevices.length,
        commandsTotal: commands.length,
        commandsPending: pendingCommands,
        commandsCompleted: completedCommands,
        commandsFailed: failedCommands,
        eventsTotal: events,
        totalRegisteredCommands: getTotalCommands(),
        serverTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
