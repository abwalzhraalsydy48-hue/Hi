import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/devices/[id] - Get device details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const device = await db.device.findUnique({
      where: { id },
      include: {
        commands: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!device) {
      return NextResponse.json({ ok: false, error: 'Device not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, device });
  } catch (error) {
    console.error('Error fetching device:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch device' }, { status: 500 });
  }
}

// DELETE /api/devices/[id] - Unlink device
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const device = await db.device.findUnique({
      where: { id }
    });

    if (!device) {
      return NextResponse.json({ ok: false, error: 'Device not found' }, { status: 404 });
    }

    // Delete device and all related commands
    await db.device.delete({
      where: { id }
    });

    // Create event
    await db.event.create({
      data: {
        event: 'Device removed',
        details: JSON.stringify({ deviceId: id, name: device.name })
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting device:', error);
    return NextResponse.json({ ok: false, error: 'Failed to delete device' }, { status: 500 });
  }
}

// PUT /api/devices/[id] - Update device
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const device = await db.device.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ ok: true, device });
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json({ ok: false, error: 'Failed to update device' }, { status: 500 });
  }
}
