import { NextResponse } from 'next/server';

export async function GET() {
  const activeRiders = [
    { name: 'Tomas Bock', slug: 'tomas-bock', img: '/tomy-escuela.png' },
    { name: 'Paulo Muñoz', slug: 'paulo-munoz', img: '/paulo-1.png' },
    { name: 'Angelo Avello', slug: 'angelo-avello', img: 'https://images.unsplash.com/photo-1520156584202-0e94b9f01391?auto=format&fit=crop&w=800&q=80' },
    { name: 'Cristobal Lazcano', slug: 'cristobal-lazcano', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80' },
  ];

  // Fill up to 20 slots
  const allRiders = [...activeRiders];
  for (let i = activeRiders.length; i < 20; i++) {
    allRiders.push({
      name: 'VACÍO',
      slug: `vacio-${i + 1}`,
      img: 'https://images.unsplash.com/photo-1518721332565-4d5dcba6676c?auto=format&fit=crop&w=800&q=80'
    });
  }

  return NextResponse.json(allRiders);
}
