import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTelegramBot, buildInlineKeyboard, inlineButton } from '@/lib/telegram';

// GET /api/devices - List all devices
export async function GET() {
  try {
    const devices = await db.device.findMany({
      orderBy: { lastSeen: 'desc' },
      include: {
        _count: {
          select: { commands: true }
        }
      }
    });

    return NextResponse.json({
      ok: true,
      devices: devices.map(d => ({
        ...d,
        commandsCount: d._count.commands
      }))
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch devices' }, { status: 500 });
  }
}

// POST /api/devices - Register a new device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, name, model, brand, os, battery, linkCode } = body;

    if (!deviceId) {
      return NextResponse.json({ ok: false, error: 'Device ID required' }, { status: 400 });
    }

    // Check if device exists
    let device = await db.device.findUnique({
      where: { id: deviceId }
    });

    if (device) {
      // Update existing device
      device = await db.device.update({
        where: { id: deviceId },
        data: {
          name: name || device.name,
          model: model || device.model,
          brand: brand || device.brand,
          os: os || device.os,
          battery: battery || device.battery,
          active: true,
          lastSeen: new Date()
        }
      });
    } else {
      // Create new device
      if (linkCode) {
        // Verify link code
        const code = await db.linkCode.findUnique({
          where: { code: linkCode }
        });

        if (!code || code.used) {
          return NextResponse.json({ ok: false, error: 'Invalid or used link code' }, { status: 400 });
        }

        device = await db.device.create({
          data: {
            id: deviceId,
            name: name || deviceId,
            model,
            brand,
            os,
            battery,
            active: true,
            lastSeen: new Date(),
            linkCodeId: code.id
          }
        });

        // Mark link code as used
        await db.linkCode.update({
          where: { id: code.id },
          data: {
            used: true,
            deviceId: device.id,
            usedAt: new Date()
          }
        });

        // Notify admin via Telegram
        const bot = getTelegramBot();
        await bot.sendAdmin(
          `📱 <b>تم ربط جهاز جديد!</b>\n\n` +
          `🆔 المعرف: <code>${device.id}</code>\n` +
          `📱 الاسم: <b>${device.name}</b>\n` +
          `📱 الموديل: <b>${model || '-'}</b>\n` +
          `🏢 الشركة: <b>${brand || '-'}</b>\n` +
          `🤖 النظام: <b>${os || '-'}</b>\n\n` +
          `✅ الجهاز متصل ومستعد`,
          {
            reply_markup: buildInlineKeyboard([
              [inlineButton('📱 إدارة الجهاز', `dev_${device.id}`)],
              [inlineButton('📋 القائمة الرئيسية', 'menu_main')]
            ])
          }
        );
      } else {
        device = await db.device.create({
          data: {
            id: deviceId,
            name: name || deviceId,
            model,
            brand,
            os,
            battery,
            active: true,
            lastSeen: new Date()
          }
        });
      }
    }

    return NextResponse.json({ ok: true, device });
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json({ ok: false, error: 'Failed to register device' }, { status: 500 });
  }
}
