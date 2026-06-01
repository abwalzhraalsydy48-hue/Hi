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
    const onlineDevices = devices.filter(d => {
      if (!d.lastSeen) return false;
      const diff = now.getTime() - d.lastSeen.getTime();
      return diff < 5 * 60 * 1000; // 5 minutes
    });

    const pendingCommands = commands.filter(c => c.status === 'pending').length;
    const completedCommands = commands.filter(c => c.status === 'completed').length;

    return NextResponse.json({
      ok: true,
      stats: {
        devicesTotal: devices.length,
        devicesOnline: onlineDevices.length,
        commandsTotal: commands.length,
        commandsPending: pendingCommands,
        commandsCompleted: completedCommands,
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
