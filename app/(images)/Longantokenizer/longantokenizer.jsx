'use client'
import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Scissors, RefreshCw } from "lucide-react";

export default function LonganTokenizer() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleTokenize = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/tokenize`, {
        text: input
      });

      if (response.data.tokens && Array.isArray(response.data.tokens.result)) {
        setResult(response.data.tokens.result.join("\n"));
      } else {
        setResult("ไม่สามารถตัดคำได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      console.error("API Error:", error);
      setResult(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTokenize();
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="backdrop-blur-sm bg-white shadow-xl rounded-2xl overflow-hidden border-t-4 border-blue-500">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                ระบบตัดคำและประโยคภาษาไทย
              </h1>
              <p className="text-gray-600">
                ระบบตัดคำและประโยคภาษาไทยอัตโนมัติ
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  rows="6"
                  maxLength="2000"
                  required
                  placeholder="กรุณาพิมพ์ข้อความภาษาไทยที่ต้องการตัดคำและประโยค..."
                />
                <p className="text-sm text-gray-500 text-right mt-1">
                  {input.length}/2000 ตัวอักษร
                </p>
              </div>

              <Button
                onClick={handleTokenize}
                disabled={isLoading || !input.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    <Scissors className="w-5 h-5 mr-2" />
                    ตัดคำและประโยค
                  </>
                )}
              </Button>

              {result && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-xl font-bold">ผลลัพธ์การตัดคำและประโยค</h2>
                    <div className="h-px flex-1 bg-gray-200"></div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="whitespace-pre-line text-lg leading-relaxed">
                      {result.split('\n').map((line, i) => (
                        <p key={i} className="mb-2">
                          {line}
                        </p>
                      ))}
                    </div>
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
