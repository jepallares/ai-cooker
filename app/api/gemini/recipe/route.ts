import { NextRequest, NextResponse } from 'next/server';
import { extractRecipeFromPhoto } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { base64, mimeType } = await req.json();
    const result = await extractRecipeFromPhoto(base64, mimeType);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Gemini recipe error:', err);
    return NextResponse.json({ error: 'Error extrayendo la receta' }, { status: 500 });
  }
}
