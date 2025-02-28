import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text');

  try {
    // เพิ่มการจัดการ query parameters
    const queryParams = new URLSearchParams({
      text: text,
      mode: 'standard' // เพิ่ม mode เพื่อให้ API เข้าใจ context มากขึ้น
    });

    const response = await fetch('https://api.aiforthai.in.th/emoji?' + queryParams.toString(), {
      method: 'GET',
      headers: {
        'Apikey': 'WCBVuLSfCCqlRsA3bX8bB6MZKWoX6ata',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
    });

    const data = await response.json();

    // ตรวจสอบและแปลงข้อมูลให้ถูกต้อง
    const processedData = {};
    for (const [key, value] of Object.entries(data)) {
      // แปลงค่าให้เป็นตัวเลขและปรับให้อยู่ในช่วง 0-1
      const score = parseFloat(value);
      if (!isNaN(score)) {
        processedData[key] = score;
      }
    }

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Emoji API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text', details: error.message },
      { status: 500 }
    );
  }
}
