import { NextRequest, NextResponse } from 'next/server';
import { classifyProductPhoto } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { base64, mimeType } = await req.json();
    const result = await classifyProductPhoto(base64, mimeType);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Gemini classify error:', err);
    return NextResponse.json({ error: 'Error clasificando la imagen' }, { status: 500 });
  }
}
