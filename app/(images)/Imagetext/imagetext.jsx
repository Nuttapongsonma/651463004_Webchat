'use client'
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2, X, Image as ImageIcon, Search } from "lucide-react";

export default function ImageTextSearch() {
  const [keywords, setKeywords] = useState('');
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 3) {
      alert('สามารถอัพโหลดได้สูงสุด 3 ไฟล์');
      return;
    }

    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 2.5 * 1024 * 1024) {
      alert('ขนาดไฟล์รวมต้องไม่เกิน 2.5 MB');
      return;
    }

    setFiles(selectedFiles);
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const searchImages = async (e) => {
    e.preventDefault();
    if (!keywords.trim() || files.length === 0) {
      alert('กรุณาใส่คำค้นและเลือกไฟล์ภาพ');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('arr', keywords);
    formData.append('num', '5');
    files.forEach(file => formData.append('image', file));

    try {
      const response = await fetch('https://api.aiforthai.in.th/sme-image-search/search', {
        method: 'POST',
        headers: {
          'Apikey': 'WCBVuLSfCCqlRsA3bX8bB6MZKWoX6ata'
        },
        body: formData
      });

      const data = await response.json();
      if (data.status === 'success') {
        setResult(data);
      } else {
        throw new Error('การค้นหาไม่สำเร็จ');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchImages(e);
    }
  };

  return (
    <div className="min-h-screen bg-white py-4">
      <div className="container mx-auto px-2 max-w-4xl">
        <Card className="bg-white shadow-lg rounded-xl overflow-hidden border-t-4 border-blue-500">
          <CardContent className="p-4">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <ImageIcon className="w-8 h-8 text-blue-500" />
                <h1 className="text-3xl font-bold text-gray-800">
                  ค้นหาความสัมพันธ์ระหว่างภาพและข้อความ
                </h1>
              </div>
              <p className="text-gray-600">
                อัพโหลดรูปภาพและระบุคำค้นที่เกี่ยวข้องเพื่อค้นหาความสัมพันธ์
              </p>
            </div>

            <form onSubmit={searchImages} className="space-y-4">
              {/* Keywords Input - ปรับความสูงกลับเป็นแบบเดิม */}
              <div className="space-y-2">
                <label className="text-lg font-medium text-gray-700 block">
                  คำค้นที่เกี่ยวข้อง:
                </label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="เช่น ต้นไม้, กระดาษ, รถบรรทุก (คั่นด้วยเครื่องหมาย ,)"
                  className="w-full text-lg py-6 px-4 border-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* File Upload Section - ปรับความสูงกลับเป็นแบบเดิม */}
              <div className="space-y-2">
                <label className="text-lg font-medium text-gray-700 block">
                  อัพโหลดรูปภาพ:
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50/50">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png"
                    multiple
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block text-center">
                    <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                    <p className="text-gray-600">
                      ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      สูงสุด 3 ไฟล์, รวมไม่เกิน 2.5 MB (JPEG, PNG)
                    </p>
                  </label>
                </div>
              </div>

              {/* Image Previews - ปรับขนาดรูปภาพ */}
              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from(files).map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Button - ปรับความสูงให้เท่ากับหน้าอื่น */}
              <Button
                type="submit"
                disabled={isLoading || !keywords.trim() || files.length === 0}
                className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังค้นหา...</>
                ) : (
                  <><Search className="w-5 h-5 mr-2" /> ค้นหา</>
                )}
              </Button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 animate-fadeIn">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Results Section - ปรับขนาด spacing */}
            {result && (
              <div className="mt-6 space-y-4">
                <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-medium mb-2">ค่าความสัมพันธ์</h3>
                    <p className="text-4xl font-bold">
                      {(result.correlation * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.filenames.map((filename, index) => (
                    <Card key={index} className="overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02]">
                      <img
                        src={filename}
                        alt={result.productnames[index]}
                        className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                      />
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 text-gray-800">
                          {result.productnames[index]}
                        </h3>
                        <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                          รหัสสินค้า: {result.unspsc[index]}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
