import { NextRequest, NextResponse } from 'next/server';
import { generateMenuProposal } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await generateMenuProposal(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Gemini menu error:', err);
    return NextResponse.json({ error: 'Error generando el menú' }, { status: 500 });
  }
}
