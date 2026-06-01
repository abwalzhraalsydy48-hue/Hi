import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTelegramBot } from '@/lib/telegram';
import { COMMAND_REGISTRY } from '@/lib/commands';

// GET /api/commands/[id] - Get command status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const command = await db.command.findUnique({
      where: { id },
      include: { device: true }
    });

    if (!command) {
      return NextResponse.json({ ok: false, error: 'Command not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, command });
  } catch (error) {
    console.error('Error fetching command:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch command' }, { status: 500 });
  }
}

// POST /api/commands/[id]/result - Submit command result
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, result } = body;

    const command = await db.command.findUnique({
      where: { id },
      include: { device: true }
    });

    if (!command) {
      return NextResponse.json({ ok: false, error: 'Command not found' }, { status: 404 });
    }

    // Update command status
    const updatedCommand = await db.command.update({
      where: { id },
      data: {
        status: status || 'completed',
        result: result ? JSON.stringify(result) : null,
        completedAt: new Date()
      }
    });

    // Update device last seen
    await db.device.update({
      where: { id: command.deviceId },
      data: { lastSeen: new Date(), active: true }
    });

    // Forward result to Telegram
    const bot = getTelegramBot();
    const cmdInfo = Object.entries(COMMAND_REGISTRY).find(([, info]) => info.cmd === command.command);
    
    let displayText = 'تم بنجاح';
    if (result) {
      if (typeof result === 'string') {
        displayText = result;
      } else if (result.message) {
        displayText = result.message;
      } else if (result.data) {
        displayText = JSON.stringify(result.data, null, 2);
      } else {
        displayText = JSON.stringify(result, null, 2);
      }
    }

    const emoji = status === 'completed' || status === 'success' ? '✅' : status === 'error' ? '❌' : '📋';

    await bot.sendAdmin(
      `${emoji} <b>نتيجة الأمر</b>\n\n` +
      `📱 الجهاز: <code>${command.device?.name || command.deviceId}</code>\n` +
      `📋 الأمر: ${cmdInfo?.desc || command.command}\n` +
      `🆔 المعرف: <code>${id}</code>\n\n` +
      `<code>${displayText.substring(0, 3000)}</code>`
    );

    // Create event
    await db.event.create({
      data: {
        deviceId: command.deviceId,
        event: 'Command completed',
        details: JSON.stringify({ command: command.command, cmdId: id, status })
      }
    });

    return NextResponse.json({ ok: true, command: updatedCommand });
  } catch (error) {
    console.error('Error updating command:', error);
    return NextResponse.json({ ok: false, error: 'Failed to update command' }, { status: 500 });
  }
}
