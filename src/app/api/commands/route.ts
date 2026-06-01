import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTelegramBot, buildInlineKeyboard, inlineButton } from '@/lib/telegram';
import { COMMAND_REGISTRY } from '@/lib/commands';
import { nanoid } from 'nanoid';

// GET /api/commands - List commands (optionally filter by device)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: Record<string, unknown> = {};
    if (deviceId) where.deviceId = deviceId;
    if (status) where.status = status;

    const commands = await db.command.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { device: true }
    });

    return NextResponse.json({ ok: true, commands });
  } catch (error) {
    console.error('Error fetching commands:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch commands' }, { status: 500 });
  }
}

// POST /api/commands - Queue a new command
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, command, params } = body;

    if (!deviceId || !command) {
      return NextResponse.json({ ok: false, error: 'Device ID and command required' }, { status: 400 });
    }

    // Verify device exists
    const device = await db.device.findUnique({
      where: { id: deviceId }
    });

    if (!device) {
      return NextResponse.json({ ok: false, error: 'Device not found' }, { status: 404 });
    }

    // Get command info
    const cmdInfo = Object.entries(COMMAND_REGISTRY).find(([, info]) => info.cmd === command);

    // Create command
    const cmd = await db.command.create({
      data: {
        id: nanoid(8),
        deviceId,
        command,
        params: params ? JSON.stringify(params) : null,
        status: 'pending'
      }
    });

    // Notify admin via Telegram
    const bot = getTelegramBot();
    await bot.sendAdmin(
      `⏳ <b>تم إرسال أمر</b>\n\n` +
      `📱 الجهاز: <code>${device.name || device.id}</code>\n` +
      `📋 الأمر: ${cmdInfo?.desc || command}\n` +
      `🆔 المعرف: <code>${cmd.id}</code>\n\n` +
      `⏳ بانتظار استجابة الجهاز...`,
      {
        reply_markup: buildInlineKeyboard([
          [inlineButton('📊 حالة الأوامر', 'cmd_status')],
          [inlineButton('📱 إدارة الجهاز', `dev_${device.id}`)]
        ])
      }
    );

    // Create event
    await db.event.create({
      data: {
        deviceId,
        event: 'Command queued',
        details: JSON.stringify({ command, cmdId: cmd.id })
      }
    });

    return NextResponse.json({ ok: true, command: cmd });
  } catch (error) {
    console.error('Error creating command:', error);
    return NextResponse.json({ ok: false, error: 'Failed to create command' }, { status: 500 });
  }
}
