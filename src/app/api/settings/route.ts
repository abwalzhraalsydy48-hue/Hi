import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/settings - Get all settings
export async function GET() {
  try {
    const settings = await db.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      ok: true,
      settings: {
        adminPassword: settingsMap.adminPassword || 'admin',
        syncInterval: parseInt(settingsMap.syncInterval || '300'),
        locationInterval: parseInt(settingsMap.locationInterval || '60'),
        autoLocation: settingsMap.autoLocation === 'true',
        autoSync: settingsMap.autoSync === 'true',
        language: settingsMap.language || 'ar',
        notifications: settingsMap.notifications !== 'false',
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      const strValue = String(value);
      await db.setting.upsert({
        where: { key },
        create: { key, value: strValue },
        update: { value: strValue }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ ok: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
