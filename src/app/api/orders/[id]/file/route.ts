import { NextRequest, NextResponse } from 'next/server';
import { getDB, OrderFile } from '@/lib/db';
import { generateDownloadUrl, getPublicUrl } from '@/lib/r2';

export const runtime = 'edge';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, params: RouteParams) {
  try {
    const { id } = await params.params;
    const db = getDB();

    // Get the first file for this order
    const file = await db.prepare(`
      SELECT * FROM order_files WHERE order_id = ? LIMIT 1
    `).bind(id).first<OrderFile>();

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const downloadUrl = await generateDownloadUrl(file.file_key);
    const previewUrl = getPublicUrl(file.file_key);

    return NextResponse.json({
      downloadUrl,
      previewUrl,
      fileName: file.file_name,
      mimeType: file.mime_type,
    });
  } catch (error) {
    console.error('File URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
