import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/v1/device/[id]/commands - Get pending commands for device
export async function GET(
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

    // Get pending commands
    const commands = await db.command.findMany({
      where: {
        deviceId,
        status: 'queued'
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: 10
    });

    // Mark as delivered
    if (commands.length > 0) {
      await db.command.updateMany({
        where: {
          id: { in: commands.map(c => c.id) }
        },
        data: {
          status: 'delivered',
          deliveredAt: new Date()
        }
      });
    }

    // Format commands for device
    const formattedCommands = commands.map(cmd => ({
      id: cmd.id,
      type: cmd.command.split('_')[0] || 'system',
      action: cmd.command.split('_')[1] || cmd.command,
      params: cmd.params ? JSON.parse(cmd.params) : {},
      timestamp: cmd.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      commands: formattedCommands
    });

  } catch (error) {
    console.error('[Commands] Error:', error);
    return NextResponse.json({
      success: false,
      commands: []
    }, { status: 500 });
  }
}
