import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTelegramBot, buildInlineKeyboard, inlineButton } from '@/lib/telegram';
import { COMMAND_REGISTRY, COMMAND_PARAMS } from '@/lib/commands';

// GET /api/devices - List all devices with health info
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

    // Calculate device states
    const now = new Date();
    const devicesWithState = devices.map(d => {
      const lastSeen = d.lastSeen ? new Date(d.lastSeen) : null;
      const secondsSinceLastSeen = lastSeen ? (now.getTime() - lastSeen.getTime()) / 1000 : Infinity;
      
      let state = 'offline';
      if (secondsSinceLastSeen < 90) {
        state = d.state || 'online';
        if (d.batteryStatus === 'charging') state = 'charging';
        else if (d.battery && parseInt(d.battery) <= 20) state = 'low_battery';
      }

      return {
        ...d,
        state,
        commandsCount: d._count.commands
      };
    });

    return NextResponse.json({
      ok: true,
      devices: devicesWithState
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
    const { deviceId, name, model, brand, os, androidVersion, battery, linkCode } = body;

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
          androidVersion: androidVersion ? parseInt(androidVersion) : device.androidVersion,
          battery: battery || device.battery,
          active: true,
          state: 'online',
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
            androidVersion: androidVersion ? parseInt(androidVersion) : null,
            battery,
            active: true,
            state: 'online',
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
        try {
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
        } catch (e) {
          console.error('Failed to notify admin:', e);
        }
      } else {
        device = await db.device.create({
          data: {
            id: deviceId,
            name: name || deviceId,
            model,
            brand,
            os,
            androidVersion: androidVersion ? parseInt(androidVersion) : null,
            battery,
            active: true,
            state: 'online',
            lastSeen: new Date()
          }
        });
      }
    }

    // Create/update device session
    await db.deviceSession.upsert({
      where: { id: `${deviceId}-session` },
      create: {
        id: `${deviceId}-session`,
        deviceId: device.id,
        state: 'online',
        lastHeartbeat: new Date(),
        connectedAt: new Date()
      },
      update: {
        state: 'online',
        lastHeartbeat: new Date()
      }
    });

    // Create event
    await db.event.create({
      data: {
        deviceId: device.id,
        event: 'Device registered',
        details: JSON.stringify({ id: device.id, name: device.name })
      }
    });

    return NextResponse.json({ ok: true, device });
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json({ ok: false, error: 'Failed to register device' }, { status: 500 });
  }
}
