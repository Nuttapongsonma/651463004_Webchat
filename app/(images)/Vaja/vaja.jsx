'use client'
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle, Volume2 } from "lucide-react";

export default function VajaSynthesizer() {
  const [text, setText] = useState('');
  const [speaker, setSpeaker] = useState('1');
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioCtx, setAudioCtx] = useState(null);
  const [audioSource, setAudioSource] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAudioCtx(new (window.AudioContext || window.webkitAudioContext)());
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchWithRetry('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim(), speaker })
      });

      const data = await response.json();

      if (data.wav_url) {
        const audioBlob = await fetchWithRetry(data.wav_url, {
          headers: {
            'Apikey': 'WCBVuLSfCCqlRsA3bX8bB6MZKWoX6ata'
          }
        }).then(res => res.blob());
        const arrayBuffer = await audioBlob.arrayBuffer();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedBuffer);
      } else {
        throw new Error(data.error || 'ไม่พบ URL เสียง');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('ไม่สามารถสังเคราะห์เสียงได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

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

  const playAudio = () => {
    if (audioBuffer) {
      if (audioSource) {
        audioSource.stop();
      }
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start(0);
      setAudioSource(source);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border-t-4 border-blue-500">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                ระบบสังเคราะห์เสียงพูดภาษาไทย
              </h1>
              <p className="text-gray-600">
                สังเคราะห์เสียงพูดจากข้อความภาษาไทย (วาจา9)
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="synthesisText" className="block text-lg font-medium text-gray-700">
                  ข้อความที่ต้องการสั่งเคราะห์เสียง:
                </label>
                <textarea
                  id="synthesisText"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="พิมพ์ข้อความภาษาไทยที่นี่..."
                  maxLength="500"
                  required
                  rows={5}
                  className="w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all resize-y text-base"
                />
                <p className="text-sm text-gray-500 text-right">
                  {text.length}/500 ตัวอักษร
                </p>
              </div>

              {/* Speaker Selection */}
              <div className="space-y-2">
                <label className="text-lg font-medium text-gray-700 block">
                  เลือกเสียง:
                </label>
                <select
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  className="w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">เสียงผู้หญิง</option>
                  <option value="0">เสียงผู้ชาย</option>
                  <option value="2">เสียงเด็กชาย</option>
                  <option value="3">เสียงเด็กหญิง</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !text.trim()}
                className="w-full py-6 text-lg bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    กำลังสังเคราะห์เสียง...
                  </>
                ) : (
                  <>
                    สังเคราะห์เสียง
                  </>
                )}
              </Button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mt-6">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Audio Player */}
            {audioBuffer && (
              <div className="mt-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">ผลการสังเคราะห์เสียง</h3>
                  <Button onClick={playAudio} className="w-full py-6 text-lg bg-blue-600 text-white">
                    <Volume2 className="w-5 h-5 mr-2" />เล่นเสียง
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
