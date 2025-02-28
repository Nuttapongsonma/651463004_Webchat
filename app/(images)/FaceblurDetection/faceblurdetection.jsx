'use client'
import { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, RefreshCw } from "lucide-react";
import Image from 'next/image';
import axios from 'axios';

export default function FaceBlurDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [blurredImage, setBlurredImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [faceData, setFaceData] = useState(null);
  const requestRef = useRef(null);

  const API_KEY = 'WCBVuLSfCCqlRsA3bX8bB6MZKWoX6ata';
  const API_URL = '/api/face-blur';

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ตรวจสอบขนาดไฟล์
    if (file.size > 2 * 1024 * 1024) { // 2MB
      setError('ขนาดไฟล์ต้องไม่เกิน 2MB');
      return;
    }

    // ตรวจสอบนามสกุลไฟล์
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('รองรับเฉพาะไฟล์ .jpg, .jpeg, .png เท่านั้น');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setBlurredImage(null);
    setFaceData(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    // ยกเลิก request เก่าและล้าง state
    if (requestRef.current) {
      requestRef.current.abort('Cancel previous request');
      requestRef.current = null;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    // สร้าง controller ใหม่
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      // ตั้ง timeout แยก
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('การเชื่อมต่อใช้เวลานานเกินไป'));
        }, 30000);
      });

      // ทำ request พร้อมกับ timeout
      const fetchPromise = fetch(API_URL, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      // รอทั้ง timeout และ request
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      const data = await response.json();

      // ตรวจสอบว่า request ยังไม่ถูกยกเลิก
      if (controller.signal.aborted) {
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการประมวลผล');
      }

      if (!data || (!data.json_data && !data.blur_img)) {
        throw new Error('ไม่พบข้อมูลที่ถูกต้อง');
      }

      setFaceData(data.json_data || []);
      setBlurredImage(data.blur_img);

    } catch (err) {
      // จัดการ error ที่เกิดขึ้น
      if (err.name === 'AbortError' || controller.signal.aborted) {
        setError('การส่งข้อมูลถูกยกเลิก กรุณาลองใหม่อีกครั้ง');
      } else {
        setError(err.message || 'เกิดข้อผิดพลาดในการประมวลผล');
      }
      console.error('Client Error:', err);
      
      setFaceData(null);
      setBlurredImage(null);
    } finally {
      // ตรวจสอบก่อนเปลี่ยนสถานะ
      if (!controller.signal.aborted) {
        setLoading(false);
      }
      requestRef.current = null;
    }
  };

  // ปรับปรุง resetAll function
  const resetAll = () => {
    // ยกเลิก request ที่กำลังทำงาน
    if (requestRef.current) {
      requestRef.current.abort('User cancelled');
      requestRef.current = null;
    }

    setLoading(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setSelectedFile(null);
    setPreviewUrl(null);
    setBlurredImage(null);
    setError(null);
    setFaceData(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white py-4">
      <div className="container mx-auto px-2 max-w-4xl">
        <Card className="bg-white shadow-lg rounded-xl overflow-hidden border-t-4 border-blue-500">
          <CardContent className="p-4">
            {/* Header Section - คงขนาด font เดิม */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                ระบบตรวจจับและเซ็นเซอร์ใบหน้า
              </h1>
              <p className="text-gray-600">อัพโหลดรูปภาพเพื่อตรวจจับและเซ็นเซอร์ใบหน้าอัตโนมัติ</p>
            </div>
            
            <div className="space-y-4">
              {/* Control Buttons - ปรับขนาดปุ่มให้กะทัดรัด */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={() => document.getElementById('fileInput').click()}
                  className="bg-blue-600 text-white px-4 py-2 text-base" // ปรับขนาดปุ่ม
                >
                  <Upload className="w-4 h-4 mr-2" /> {/* ปรับขนาดไอคอน */}
                  เลือกรูปภาพ
                </Button>
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
                
                {selectedFile && (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`text-white px-4 py-2 text-base transition-colors duration-200 ${
                      loading 
                        ? 'bg-green-300 hover:bg-green-300'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <div className="flex items-center">
                      {loading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4 mr-2" />
                      )}
                      <span>
                        {loading ? 'กำลังประมวลผล...' : 'เริ่มตรวจจับใบหน้า'}
                      </span>
                    </div>
                  </Button>
                )}

                {(previewUrl || blurredImage) && (
                  <Button
                    onClick={resetAll}
                    variant="destructive"
                    className="shadow px-4 py-2 text-base" // ปรับขนาดปุ่ม
                  >
                    รีเซ็ต
                  </Button>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 whitespace-pre-wrap">{error}</p>
                      <button 
                        onClick={() => setError(null)}
                        className="mt-2 text-xs text-red-600 hover:text-red-800"
                      >
                        ปิดข้อความ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* ลด gap */}
                {/* Original Image Container */}
                <div className="space-y-4">
                  {previewUrl && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">รูปภาพต้นฉบับ</h3>
                      <div className="relative aspect-video border border-gray-200 rounded-lg overflow-hidden">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                    </div>
                  )}

                  {blurredImage && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">รูปภาพที่เบลอ</h3>
                      <div className="relative aspect-video border border-gray-200 rounded-lg overflow-hidden">
                        <Image
                          src={blurredImage}
                          alt="Blurred Preview"
                          fill
                          className="object-contain p-2 blur-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Censored Image */}
                {blurredImage && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">รูปภาพที่ผ่านการเซ็นเซอร์</h3>
                    <div className="relative aspect-video border border-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src={blurredImage}
                        alt="Blurred"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Results Display */}

              {faceData && (
                <div className="mt-6 space-y-4"> {/* ลด margin และ spacing */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold flex items-center">
                      <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      พบใบหน้าทั้งหมด {faceData.length} คน
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {faceData.map((face, index) => (
                      <div 
                        key={index} 
                        className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                      >
                        <div className="flex items-center mb-4">
                          <div className="h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                            {index + 1}
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">ใบหน้าที่ {index + 1}</h4>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 p-2 rounded">X1: {face.x0}</div>
                            <div className="bg-gray-50 p-2 rounded">X2: {face.x1}</div>
                            <div className="bg-gray-50 p-2 rounded">Y1: {face.y0}</div>
                            <div className="bg-gray-50 p-2 rounded">Y2: {face.y1}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
