'use client'
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SmilePlus, Loader2, AlertTriangle } from "lucide-react";
import axios from 'axios';

const EMOJI_MAP = {
  "0": { 
    emoji: "😊", 
    name: "มีความสุข",
    options: ['🙂','😄','😁','😆','😀','😊','😃']
  },
  "1": { 
    emoji: "😢", 
    name: "เศร้า",
    options: ['😢','😥','😰','😓','🙁','😟','😞','😔','😣','😫','😩']
  },
  "2": { 
    emoji: "😡", 
    name: "โกรธ",
    options: ['😡','😠','😤','😖']
  },
  "3": { 
    emoji: "🙄", 
    name: "เบื่อ",
    options: ['🙄','😒','😑','😕']
  },
  "4": { 
    emoji: "😱", 
    name: "ตกใจมาก",
    options: ['😱']
  },
  "5": { 
    emoji: "😨", 
    name: "กลัว",
    options: ['😨','😧','😦']
  },
  "6": { 
    emoji: "😮", 
    name: "ประหลาดใจ",
    options: ['😮','😲','😯']
  },
  "7": { 
    emoji: "😴", 
    name: "ง่วง",
    options: ['😴','😪']
  },
  "8": { 
    emoji: "😋", 
    name: "อร่อย",
    options: ['😋','😜','😝','😛']
  },
  "9": { 
    emoji: "😍", 
    name: "รัก",
    options: ['😍','💕','😘','😚','😙','😗']
  },
  "10": { 
    emoji: "😌", 
    name: "โล่งใจ",
    options: ['😌']
  },
  "11": { 
    emoji: "😐", 
    name: "เฉยๆ",
    options: ['😐']
  },
  "12": { 
    emoji: "😷", 
    name: "ป่วย",
    options: ['😷']
  },
  "13": { 
    emoji: "😳", 
    name: "ตกใจ",
    options: ['😳']
  },
  "14": { 
    emoji: "😵", 
    name: "มึน",
    options: ['😵']
  },
  "15": { 
    emoji: "💔", 
    name: "อกหัก",
    options: ['💔']
  },
  "16": { 
    emoji: "😎", 
    name: "เท่",
    options: ['😎','😈']
  },
  "17": { 
    emoji: "🙃", 
    name: "กวน",
    options: ['🙃','😏','😂','😭']
  },
  "18": { 
    emoji: "😬", 
    name: "เขิน",
    options: ['😬','😅','😶']
  },
  "19": { 
    emoji: "😉", 
    name: "ขยิบตา",
    options: ['😉']
  },
  "20": { 
    emoji: "💖", 
    name: "หัวใจ",
    options: ['💖','💙','💚','💗','💓','💜','💘','💛']
  },
  "21": { 
    emoji: "😇", 
    name: "ทำดี",
    options: ['😇']
  },
    "22": { 
    emoji: "🐱", 
    name: "แมว",
    options: ['🐱','😺','😸','😹','😻','😽','🐈']
  },
    "23": { 
    emoji: "🐶", 
    name: "หมา",
    options: ['🐶','🐕','🦮','🐩','🐾']
  },
    "24": { 
    emoji: "🐰", 
    name: "กระต่าย",
    options: ['🐰','🐇','🦊']
  },
    "25": { 
    emoji: "🐼", 
    name: "แพนด้า",
    options: ['🐼','🐨','🧸']
  },
    "26": { 
    emoji: "🦁", 
    name: "สิงโต",
    options: ['🦁','🐯','🐅']
  },
    "27": { 
    emoji: "🐷", 
    name: "หมู",
    options: ['🐷','🐽','🐖']
  },
    "28": { 
    emoji: "🐸", 
    name: "กบ",
    options: ['🐸','🐊','🦎']
  },
    "29": { 
    emoji: "🦋", 
    name: "ผีเสื้อ",
    options: ['🦋','🐛','🐝']
  },
    "30": { 
    emoji: "🌺", 
    name: "ดอกไม้",
    options: ['🌺','🌸','🌹','🌷','🌼','💐']
  },
    "31": { 
    emoji: "🌈", 
    name: "รุ้ง",
    options: ['🌈','☀️','⭐','✨']
  },
    "32": { 
    emoji: "🎀", 
    name: "โบว์",
    options: ['🎀','🎈','🎉','🎊']
  },
    "33": { 
      emoji: "🐔", 
      name: "ไก่",
      options: ['🐔','🐓','🐤','🐥','🐣']
  }
};

export default function Thaimoji() {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRandomEmoji = (category) => {
    const emojiSet = EMOJI_MAP[category]?.options;
    if (!emojiSet || emojiSet.length === 0) return EMOJI_MAP[category]?.emoji || "❓";
    return emojiSet[Math.floor(Math.random() * emojiSet.length)];
  };

  const analyzeText = async (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/thaimoji', {
        params: { text: text.trim() }
      });

      if (response.data && !response.data.error) {
        const sortedResults = Object.entries(response.data)
          .map(([key, score]) => ({
            emoji: getRandomEmoji(key),
            name: EMOJI_MAP[key]?.name || "ไม่ระบุ",
            score: Math.min(Math.max(score * 100, 0), 100), // จำกัดค่าระหว่าง 0-100
            category: key
          }))
          .sort((a, b) => b.score - a.score)
          .filter(result => result.score > 10); // เพิ่มเกณฑ์ขั้นต่ำ

        setResults(sortedResults);

        if (sortedResults.length === 0) {
          setError('ไม่พบอิโมจิที่เหมาะสมกับข้อความนี้');
        }
      } else {
        throw new Error(response.data?.error || 'ไม่สามารถวิเคราะห์ข้อความได้');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์');
    } finally {
      setIsLoading(false);
    }
  };

  const getContextWeight = (category, text) => {
    const contextMap = {
      "2": ["รัก", "ชอบ", "คิดถึง", "หลงรัก"], // ความรัก
      "1": ["ขำ", "ฮา", "555", "ตลก"], // ขำขัน
      "4": ["โกรธ", "โมโห", "เกลียด"], // โกรธ
      "3": ["เศร้า", "เสียใจ", "ร้องไห้"], // เศร้า
      "20": ["ขอบคุณ", "ขอบใจ", "ขอบพระคุณ"], // ขอบคุณ
      "22": ["แมว", "เหมียว", "น้องเหมียว", "meow"],
      "23": ["หมา", "สุนัข", "น้องหมา", "โฮ่ง", "พุดเดิ้ล"],
      "24": ["กระต่าย", "บันนี่", "กระต่ายน้อย"],
      "25": ["แพนด้า", "หมีแพนด้า", "โคอาล่า"],
      "26": ["สิงโต", "ราชสีห์", "เสือ", "เจ้าป่า"],
      "27": ["หมู", "พิกเล็ต", "ลูกหมู"],
      "28": ["กบ", "อึ่งอ่าง", "คางคก"],
      "29": ["ผีเสื้อ", "แมลง", "หนอน"],
      "30": ["ดอกไม้", "กุหลาบ", "ทิวลิป", "ช่อดอกไม้"],
      "31": ["รุ้ง", "สดใส", "แสงแดด", "ดวงดาว"],
      "32": ["โบว์", "ของขวัญ", "ปาร์ตี้", "ฉลอง"],
      "33": ["ไก่", "เจ้าไก่", "ลูกไก่", "แม่ไก่", "ไก่ย่าง", "ไก่ทอด", "กุ๊กๆ"]
    };

    if (contextMap[category]?.some(keyword => text.includes(keyword))) {
      return 1.5;
    }
    return 1;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzeText(e);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border-t-4 border-blue-500">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                <SmilePlus className="w-10 h-10 text-blue-500" />
                ระบบแนะนำอิโมจิ
              </h1>
              <p className="text-gray-600">
                วิเคราะห์และแนะนำอิโมจิที่เหมาะสมกับข้อความของคุณ
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows="5"
                    maxLength="500"
                    placeholder="พิมพ์ข้อความที่ต้องการวิเคราะห์..."
                    required
                  />
                  <p className="text-sm text-gray-500 text-right mt-1">
                    {text.length}/500 ตัวอักษร
                  </p>
                </div>

                <Button
                  onClick={analyzeText}
                  disabled={isLoading || !text.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      กำลังวิเคราะห์...
                    </>
                  ) : (
                    <>
                      <SmilePlus className="w-5 h-5 mr-2" />
                      วิเคราะห์อิโมจิ
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {results && results.length > 0 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">อิโมจิที่แนะนำ</h2>
                    <div className="h-px flex-1 bg-gray-200"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.slice(0, 6).map((result, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">{result.emoji}</span>
                            <span className="text-gray-600">{result.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-blue-600">
                              {result.score.toFixed(1)}%
                            </div>
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
