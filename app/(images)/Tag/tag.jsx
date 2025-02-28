'use client'
import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Tag as TagIcon, Hash, TrendingUp } from "lucide-react"

export default function TagSuggestion() {
  const [text, setText] = useState('')
  const [numTags, setNumTags] = useState(5)
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const analyzeTags = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new URLSearchParams()
      formData.append('text', text)
      formData.append('numtag', numTags)

      const response = await fetch('https://api.aiforthai.in.th/tagsuggestion', {
        method: 'POST',
        headers: {
          'Apikey': 'WCBVuLSfCCqlRsA3bX8bB6MZKWoX6ata',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      })

      const data = await response.json()
      setTags(data.tags || [])
    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาดในการวิเคราะห์')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzeTags(e);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border-t-4 border-blue-500">
          <CardContent className="p-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Hash className="w-12 h-12 text-blue-500" />
                <h1 className="text-3xl font-bold text-gray-800">
                  ระบบวิเคราะห์และแนะนำแท็ก
                </h1>
              </div>
              <p className="text-gray-600">
                วิเคราะห์เนื้อหาและแนะนำแท็กที่เกี่ยวข้องโดยอัตโนมัติ
              </p>
            </div>

            <form onSubmit={analyzeTags} className="space-y-8">
              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-lg font-medium text-gray-700 flex items-center gap-2">
                  <TagIcon className="w-5 h-5 text-blue-500" />
                  ข้อความที่ต้องการวิเคราะห์:
                </label>
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full p-4 border rounded-lg"
                    rows="6"
                    maxLength="2000"
                    required
                    placeholder="พิมพ์หรือวางข้อความที่ต้องการวิเคราะห์ที่นี่..."
                  />
                  <p className="text-sm text-gray-500 text-right mt-1">
                    {text.length}/2000 ตัวอักษร
                  </p>
                </div>
              </div>

              {/* Number of Tags Input */}
              <div className="space-y-2">
                <label className="text-lg font-medium text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  จำนวนแท็ก:
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={numTags}
                    onChange={(e) => setNumTags(e.target.value)}
                    min="1"
                    max="20"
                    className="w-32 text-center text-lg py-2 border-2"
                  />
                  <span className="text-sm text-gray-500">
                    ระบุจำนวนแท็กที่ต้องการ (1-20)
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !text.trim()}
                className="w-full py-6 text-lg bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    กำลังวิเคราะห์...
                  </>
                ) : (
                  <>
                    <TagIcon className="w-5 h-5 mr-2" />
                    วิเคราะห์แท็ก
                  </>
                )}
              </Button>
            </form>

            {/* Results Section */}
            {tags.length > 0 && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">ผลการวิเคราะห์</h2>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <div className="grid gap-3">
                  {tags.map((tag, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-[1.01] border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <Hash className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-lg">{tag.tag}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${tag.score * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {(tag.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
