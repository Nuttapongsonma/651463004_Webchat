'use client'
import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Languages, ArrowDownUp, AlertTriangle } from "lucide-react"
import axios from 'axios'

export default function TranslationTHEN() {
  const [text, setText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // ฟังก์ชันตรวจสอบว่าเป็นภาษาไทยหรือไม่
  const isThaiLanguage = (text) => {
    const thaiPattern = /[\u0E00-\u0E7F]/
    return thaiPattern.test(text)
  }

  const translate = async (e) => {
    e.preventDefault()
    if (!text.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // เลือก endpoint ตามภาษาที่ใส่เข้ามา
      const endpoint = isThaiLanguage(text) ? 'th2en' : 'en2th'

      const response = await axios.post(`${API_URL}/${endpoint}`, {
        text: text.trim()
      })

      console.log('API Response:', response.data)

      if (response.data.translate && response.data.translate.translated_text) {
        setTranslatedText(response.data.translate.translated_text)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Translation error:', error)
      setError('ไม่สามารถแปลภาษาได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      translate(e)
    }
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="backdrop-blur-sm bg-white shadow-xl rounded-2xl overflow-hidden border-t-4 border-blue-500">
          <CardContent className="p-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                <Languages className="w-10 h-10 text-blue-500" />
                ระบบแปลภาษา
              </h1>
              <p className="text-gray-600">
                แปลภาษาไทย-อังกฤษ อัตโนมัติ
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                <span>ไทย</span>
                <ArrowDownUp className="w-4 h-4" />
                <span>English</span>
              </div>
            </div>

            <form onSubmit={translate} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows="6"
                    maxLength="1000"
                    required
                    placeholder="พิมพ์หรือวางข้อความที่ต้องการแปล... (ภาษาไทย ⟷ English)"
                  />
                  <p className="text-sm text-gray-500 text-right mt-1">
                    {text.length}/1000 ตัวอักษร
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !text.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      กำลังแปล...
                    </>
                  ) : (
                    <>
                      <Languages className="w-5 h-5 mr-2" />
                      แปลภาษา
                    </>
                  )}
                </Button>
              </div>
            </form>

            {error && (
              <div className="mt-6 animate-fade-in">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {translatedText && (
              <div className="mt-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-bold">คำแปล</h2>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-lg leading-relaxed whitespace-pre-line">
                    {translatedText}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
