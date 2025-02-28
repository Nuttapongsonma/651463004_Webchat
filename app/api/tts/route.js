import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, speaker } = await req.json();

    const API_URL = 'https://api.aiforthai.in.th/vaja9/synth_audiovisual';
    const API_KEY = 'WCBVuLSfCCqlRsA3bX8bB6MZKWoX6ata';

    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: {
        'Apikey': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input_text: text,
        speaker: speaker,
        phrase_break: 0,
        audiovisual: 0
      })
    });

    const data = await response.json();

    if (data.wav_url) {
      return NextResponse.json({ wav_url: data.wav_url });
    } else {
      throw new Error('ไม่พบ URL เสียง');
    }

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}

async function fetchWithRetry(url, options, retries = 3) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if ((response.status === 429 || response.status === 500 || response.status === 401) && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}
