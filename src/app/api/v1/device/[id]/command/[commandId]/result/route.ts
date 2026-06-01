import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/v1/device/[id]/command/[commandId]/result - Submit command result
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commandId: string }> }
) {
  try {
    const { id: deviceId, commandId } = await params;

    if (!deviceId || !commandId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID and Command ID are required'
      }, { status: 400 });
    }

    const body = await request.json();
    const { success, data, error: cmdError } = body;

    // Find the command
    const command = await db.command.findFirst({
      where: {
        id: commandId,
        deviceId
      }
    });

    if (!command) {
      return NextResponse.json({
        success: false,
        error: 'Command not found'
      }, { status: 404 });
    }

    // Update command with result
    await db.command.update({
      where: { id: commandId },
      data: {
        status: success ? 'completed' : 'failed',
        completedAt: new Date(),
        result: data ? JSON.stringify(data) : null,
        errorMessage: cmdError || null,
        errorCode: success ? null : 'EXECUTION_ERROR'
      }
    });

    // Create event
    await db.event.create({
      data: {
        deviceId,
        event: success ? 'command_completed' : 'command_failed',
        details: `Command ${command.command} ${success ? 'completed' : 'failed'}`,
        level: success ? 'info' : 'error'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Result recorded'
    });

  } catch (error) {
    console.error('[Command Result] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to record result'
    }, { status: 500 });
  }
}
