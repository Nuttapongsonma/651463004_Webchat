import { NextResponse } from 'next/server';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(req) {
  const url = req.nextUrl.searchParams.get('url');
  const API_KEY = 'WCBVuLSfCCqlRsA3bX8bB6MZKWoX6ata';

  if (!url) {
    return NextResponse.json(
      { error: 'Missing URL parameter' },
      { status: 400 }
    );
  }

  try {
    // Add delay before fetching audio
    await wait(500);

    const response = await fetch(url, {
      headers: {
        'Apikey': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Audio API responded with status: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      throw new Error('Empty audio response');
    }

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Audio proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audio' },
      { status: error.status || 500 }
    );
  }
}
