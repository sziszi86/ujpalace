import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return URL options for banner "Tudjon meg többet" button
    const options = [
      { value: '', label: 'Nincs gomb', type: 'internal' },
      { value: '/', label: 'Főoldal', type: 'internal' },
      { value: '/tournaments', label: 'Versenyek', type: 'internal' },
      { value: '/tournaments/list', label: 'Versenyek - Lista nézet', type: 'internal' },
      { value: '/cash-games', label: 'Cash Game', type: 'internal' },
      { value: '/cash-games/list', label: 'Cash Game - Lista nézet', type: 'internal' },
      { value: '/rolunk', label: 'Rólunk', type: 'internal' },
      { value: '/gallery', label: 'Galéria', type: 'internal' },
      { value: '/blog', label: 'Hírek', type: 'internal' },
      { value: '/jatekosvedelm', label: 'Játékosvédelem', type: 'internal' },
      { value: '/contact', label: 'Kapcsolat', type: 'internal' },
      { value: 'custom', label: 'Egyedi URL...', type: 'custom' }
    ];

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error fetching options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch options' },
      { status: 500 }
    );
  }
}