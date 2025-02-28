'use client'
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ThumbsUp, ThumbsDown, Send, RefreshCw } from "lucide-react";
import axios from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const TIMEOUT = 30000;

export default function SentimentAnalysis() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/sensing', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const makeApiRequest = async (text) => {
    const response = await axios.post('/api/sensing', 
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: TIMEOUT,
      }
    );
    // ตรวจสอบ response โดยตรง
    return response.data;
  };

  const retryRequest = async (text) => {
    let lastError;
    
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const isConnected = await checkConnection();
        if (!isConnected) {
          throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        }

        const data = await makeApiRequest(text);
        
        // ตรวจสอบว่ามีข้อมูลที่ถูกต้อง
        if (!data || data.error) {
          throw new Error(data?.message || 'ไม่ได้รับข้อมูลจากเซิร์ฟเวอร์');
        }

        return data;
      } catch (err) {
        lastError = err;
        console.log(`Attempt ${i + 1} failed:`, err.message);
        
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }
    throw lastError;
  };

  const analyzeText = async (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await retryRequest(text.trim());
      
      if (result.sentiment || result.intention) {
        setResult(result);
      } else {
        throw new Error('ข้อมูลที่ได้รับไม่ถูกต้อง');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      
      let errorMessage;
      if (!navigator.onLine) {
        errorMessage = 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง';
      } else if (err.response?.status === 429) {
        errorMessage = 'มีการใช้งานระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
      } else {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzeText(e);
    }
  };

  const getSentimentColor = (polarity) => {
    switch (polarity) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderSentimentIcon = (polarity) => {
    switch (polarity) {
      case 'positive':
        return <ThumbsUp className="w-8 h-8 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="w-8 h-8 text-red-500" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleOnline = () => setError(null);
    const handleOffline = () => setError('ไม่มีการเชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อ');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkInitialConnection = async () => {
      const isConnected = await checkConnection();
      if (!isConnected) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }
    };

    checkInitialConnection();
  }, []);

  return (
    <div className="min-h-screen bg-white py-8"> {/* แก้ไขจาก bg-gradient-to-br from-blue-50 via-white to-purple-50 เป็น bg-white */}
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="backdrop-blur-sm bg-white shadow-xl rounded-2xl overflow-hidden border-t-4 border-blue-500"> {/* แก้ไข bg-white/90 เป็น bg-white */}
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                ระบบวิเคราะห์ความคิดเห็นจากข้อความ
              </h1>
              <p className="text-gray-600">
                วิเคราะห์ความรู้สึกและจุดประสงค์ของข้อความภาษาไทย
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="mb-4">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className='w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none'
                    rows="6"
                    maxLength="2000"
                    required
                    placeholder="กรุณาพิมพ์ข้อความภาษาไทยที่ต้องการวิเคราะห์..."
                  />
                  <p className="text-sm text-gray-500 text-right">
                    {text.length}/2000 ตัวอักษร
                  </p>
                </div>
                <Button
                  onClick={analyzeText}
                  disabled={isLoading || !text.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      กำลังวิเคราะห์...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      วิเคราะห์ข้อความ
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-fade-in">
                  {/* Sentiment Analysis Result */}
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">ผลการวิเคราะห์ความรู้สึก</h3>
                      {renderSentimentIcon(result.sentiment?.polarity)}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>ความรู้สึก:</span>
                        <span className={`font-semibold ${getSentimentColor(result.sentiment?.polarity)}`}>
                          {result.sentiment?.polarity === 'positive' ? 'เชิงบวก' :
                           result.sentiment?.polarity === 'negative' ? 'เชิงลบ' : 'เป็นกลาง'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>ความมั่นใจ:</span>
                        <span className="font-semibold">{result.sentiment?.score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Intention Analysis Result */}
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold mb-4">จุดประสงค์ของข้อความ</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">แสดงความคิดเห็น</div>
                        <div className="text-lg font-semibold">{result.intention?.sentiment}%</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">ประกาศ/โฆษณา</div>
                        <div className="text-lg font-semibold">{result.intention?.announcement}%</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">คำถาม</div>
                        <div className="text-lg font-semibold">{result.intention?.question}%</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">คำร้องขอ</div>
                        <div className="text-lg font-semibold">{result.intention?.request}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Keywords and Preprocessing */}
                  {result.preprocess && (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                      <h3 className="text-xl font-semibold mb-4">การวิเคราะห์คำ</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">คำสำคัญ:</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.preprocess.keyword.map((word, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">คำแสดงความรู้สึกเชิงบวก:</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.preprocess.pos.map((word, index) => (
                              <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">คำแสดงความรู้สึกเชิงลบ:</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.preprocess.neg.map((word, index) => (
                              <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
