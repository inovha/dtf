import { NextRequest, NextResponse } from 'next/server';
import { generateUploadUrl, generateFileKey } from '@/lib/r2';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { fileName?: string; contentType?: string };
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 }
      );
    }

    // Validate content type
    const validTypes = ['image/png', 'application/pdf'];
    if (!validTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Only PNG and PDF files are allowed' },
        { status: 400 }
      );
    }

    const key = generateFileKey(fileName);
    const uploadUrl = await generateUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error('Upload URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
