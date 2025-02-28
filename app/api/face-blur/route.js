import { NextResponse } from 'next/server';
import axios from 'axios';

const API_ENDPOINT = 'https://api.aiforthai.in.th/face-blur';
const API_TIMEOUT = 50000; // เพิ่มเวลา timeout

const axiosWithRetry = async (config, maxRetries = 2) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios({
        ...config,
        timeout: API_TIMEOUT,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        headers: {
          ...config.headers,
          'Accept-Encoding': 'gzip,deflate',
        },
        validateStatus: status => status < 500,
      });
      
      if (response.data) {
        return response;
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่อัพโหลด' }, { status: 400 });
    }

    const aiforThaiFormData = new FormData();
    aiforThaiFormData.append('file', file);

    const response = await axiosWithRetry({
      url: API_ENDPOINT,
      method: 'POST',
      headers: {
        'Apikey': process.env.API_KEY || 'WCBVuLSfCCqlRsA3bX8bB6MZKWoX6ata',
        'Content-Type': 'multipart/form-data',
      },
      data: aiforThaiFormData,
    });

    const result = {
      json_data: response.data.json_data || [],
      blur_img: response.data.blur_img
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Server Error:', error);
    
    let errorMessage = 'เกิดข้อผิดพลาดในการประมวลผล: ';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
    } else if (error.response?.status === 429) {
      errorMessage = 'มีการเรียกใช้งาน API มากเกินไป กรุณารอสักครู่แล้วลองใหม่';
    } else if (error.response) {
      errorMessage = error.response.data?.message || 'เซิร์ฟเวอร์ไม่สามารถประมวลผลได้';
    } else if (error.request) {
      errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ';
    } else {
      errorMessage = error.message || 'กรุณาลองใหม่อีกครั้ง';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}
