import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { generateId } from '@/lib/utils';

export const runtime = 'edge';

interface OrderRequestBody {
  customerName?: string;
  customerWhatsapp?: string;
  dtfType?: string;
  notes?: string | null;
  file?: {
    key: string;
    name: string;
    size: number;
    mimeType: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as OrderRequestBody;
    const { customerName, customerWhatsapp, dtfType, notes, file } = body;

    // Validation
    if (!customerName || !customerWhatsapp || !dtfType || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['textil', 'uv'].includes(dtfType)) {
      return NextResponse.json(
        { error: 'Invalid DTF type' },
        { status: 400 }
      );
    }

    const db = getDB();
    const orderId = generateId();
    const fileId = generateId();

    // Insert order
    await db.prepare(`
      INSERT INTO orders (id, customer_name, customer_whatsapp, dtf_type, notes, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
    `).bind(orderId, customerName, customerWhatsapp, dtfType, notes).run();

    // Insert file
    await db.prepare(`
      INSERT INTO order_files (id, order_id, file_key, file_name, file_size, mime_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(fileId, orderId, file.key, file.name, file.size, file.mimeType).run();

    return NextResponse.json({ 
      success: true, 
      orderId 
    }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = getDB();
    
    const result = await db.prepare(`
      SELECT 
        o.*,
        (SELECT COUNT(*) FROM order_files WHERE order_id = o.id) as file_count
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 100
    `).all();

    return NextResponse.json({ orders: result.results });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
