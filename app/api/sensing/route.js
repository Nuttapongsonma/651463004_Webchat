import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

export async function POST(req) {
  try {
    const { text } = await req.json();
    const formData = new URLSearchParams();
    formData.append('text', text);

    const response = await fetch('https://api.aiforthai.in.th/ssense', {
      method: 'POST',
      headers: {
        'Apikey': 'WCBVuLSfCCqlRsA3bX8bB6MZKWoX6ata',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data); // ส่งข้อมูลกลับโดยตรง
  } catch (error) {
    console.error('Sensing API Error:', error);
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
