import { NextRequest, NextResponse } from 'next/server';
import { getDB, Order, OrderFile } from '@/lib/db';

export const runtime = 'edge';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, params: RouteParams) {
  try {
    const { id } = await params.params;
    const db = getDB();

    const order = await db.prepare(`
      SELECT * FROM orders WHERE id = ?
    `).bind(id).first<Order>();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const filesResult = await db.prepare(`
      SELECT * FROM order_files WHERE order_id = ?
    `).bind(id).all<OrderFile>();

    return NextResponse.json({
      order,
      files: filesResult.results || [],
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, params: RouteParams) {
  try {
    const { id } = await params.params;
    const body = await request.json() as { status?: string };
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'processing', 'ready', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const db = getDB();

    await db.prepare(`
      UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?
    `).bind(status, id).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
