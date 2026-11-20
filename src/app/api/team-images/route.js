import { NextResponse } from 'next/server';

const CURATED_TEAM_IMAGES = [
  '/TIENDA/3.PNG',
  '/TIENDA/7.PNG',
  '/TIENDA/Captura.PNG',
  '/TIENDA/4.PNG',
  '/TIENDA/5.PNG',
  '/TIENDA/IMG_5779.jpeg',
];

export async function GET() {
  return NextResponse.json({ images: CURATED_TEAM_IMAGES });
}
