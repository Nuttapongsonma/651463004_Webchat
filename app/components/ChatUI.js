"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, Trash2, Clock, X } from "lucide-react";
import axios from "axios";

export default function ChatUI() {
  const initialMessage = {
    text: "สวัสดีครับ! ผมเป็น AI ที่พร้อมจะช่วยตอบคำถามของคุณ สามารถถามอะไรก็ได้เลย 😊",
    sender: "bot"
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("textqa");
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // เพิ่ม ref สำหรับช่องกรอกข้อความ

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    setChatHistory(savedHistory);
    
    if (selectedChatId) {
      const savedMessages = JSON.parse(localStorage.getItem(`chat_${selectedChatId}`) || '[]');
      setMessages(savedMessages.length > 0 ? savedMessages : [initialMessage]);
    } else {
      setMessages([initialMessage]); // Set initial message when no chat is selected
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (selectedChatId) {
      localStorage.setItem(`chat_${selectedChatId}`, JSON.stringify(messages));
    }
  }, [messages, selectedChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ฟังก์ชันสำหรับสร้างชื่อแชทจากข้อความ
  const generateChatTitle = (message) => {
    // ตัดข้อความให้สั้นลงถ้ายาวเกินไป
    const maxLength = 30;
    let title = message.trim();
    if (title.length > maxLength) {
      title = title.substring(0, maxLength) + "...";
    }
    return title;
  };

  const startNewChat = () => {
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      title: "การสนทนาใหม่", // ชื่อเริ่มต้น
      timestamp: new Date().toISOString(),
    };
    
    const newMessages = [initialMessage];
    
    setChatHistory(prev => [newChat, ...prev]);
    localStorage.setItem('chatHistory', JSON.stringify([newChat, ...chatHistory]));
    localStorage.setItem(`chat_${newChatId}`, JSON.stringify(newMessages));
    setSelectedChatId(newChatId);
    setMessages(newMessages);
  };

  const loadChat = (chatId) => {
    if (isLoading) {
      alert("กรุณารอคำตอบให้เสร็จสิ้นก่อน");
      return;
    }
    const savedMessages = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
    setSelectedChatId(chatId);
    setMessages(savedMessages);
  };

  const deleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    localStorage.removeItem(`chat_${chatId}`);
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory.filter(chat => chat.id !== chatId)));
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
      setMessages([initialMessage]);
    }
  };

  const updateChatTitle = (chatId, firstMessage) => {
    const updatedHistory = chatHistory.map(chat => 
      chat.id === chatId 
        ? { ...chat, title: generateChatTitle(firstMessage) }
        : chat
    );
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");

    // สร้างข้อความของผู้ใช้
    const newUserMessage = { text: userMessage, sender: "user" };
    let currentMessages = [];

    if (!selectedChatId) {
      // สร้างแชทใหม่
      const newChatId = Date.now();
      const newChat = {
        id: newChatId,
        title: userMessage,
        timestamp: new Date().toISOString(),
      };
      
      setChatHistory(prev => [newChat, ...prev]);
      localStorage.setItem('chatHistory', JSON.stringify([newChat, ...chatHistory]));
      setSelectedChatId(newChatId);
      
      // เพิ่มข้อความต้อนรับและข้อความผู้ใช้
      currentMessages = [initialMessage, newUserMessage];
      setMessages(currentMessages);
      localStorage.setItem(`chat_${newChatId}`, JSON.stringify(currentMessages));
    } else {
      // เพิ่มข้อความผู้ใช้ต่อจากข้อความที่มีอยู่
      currentMessages = [...messages, newUserMessage];
      setMessages(currentMessages);
      localStorage.setItem(`chat_${selectedChatId}`, JSON.stringify(currentMessages));
      
      // อัพเดทชื่อแชทถ้าเป็นข้อความแรก
      if (messages.length === 1 && messages[0].sender === "bot") {
        updateChatTitle(selectedChatId, userMessage);
      }
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/textqa`, {
        text: userMessage,
      });

      const botResponse = response.data.answer || "ขออภัย ผมไม่เข้าใจคำถาม กรุณาถามใหม่อีกครั้ง";
      
      // เพิ่มข้อความตอบกลับจากบอท
      const updatedMessages = [...currentMessages, { text: botResponse, sender: "bot" }];
      setMessages(updatedMessages);
      
      // บันทึกลง localStorage
      if (selectedChatId) {
        localStorage.setItem(`chat_${selectedChatId}`, JSON.stringify(updatedMessages));
      }

      // โฟกัสกลับไปที่ช่องกรอกข้อความหลังจากบอทตอบ
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

    } catch (error) {
      console.error("API Error:", error);
      const errorMessage = { 
        text: "ขออภัย มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง", 
        sender: "bot" 
      };
      const updatedMessages = [...currentMessages, errorMessage];
      setMessages(updatedMessages);
      if (selectedChatId) {
        localStorage.setItem(`chat_${selectedChatId}`, JSON.stringify(updatedMessages));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col">
        <div className="flex-grow p-4 overflow-y-auto bg-transparent backdrop-blur-sm">
          <div className="max-w-full mx-auto space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
              >
                {msg.sender === "bot" && (
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mr-3 shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                <Card
                  className={`max-w-[500px] transition-all duration-300 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200"
                      : "bg-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  <CardContent className="p-4 text-[16px] leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {/* Loading Animation */}
            {isLoading && (
              <div className="flex justify-start w-full animate-fade-in">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mr-3 shadow-lg">
                  <Bot className="w-6 h-6 text-white animate-pulse" />
                </div>
                <Card className="max-w-[500px] bg-white shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-bounce" />
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white shadow-lg backdrop-blur-lg">
          <div className="max-w-full mx-auto flex items-center gap-3">
            <Input
              ref={inputRef} // เพิ่ม ref ที่ Input component
              className="flex-grow rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-lg px-6 min-h-[50px]"
              placeholder={isLoading ? "กำลังคิดคำตอบ..." : "พิมพ์คำถามของคุณที่นี่..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading}
              className={`w-[50px] h-[50px] flex items-center justify-center transition-colors ${
                isLoading ? "bg-gray-400" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              }`}
            >
              <Send className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-white shadow-xl overflow-y-auto">
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600">
          <Button 
            onClick={startNewChat}
            className="w-full bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 text-lg font-semibold py-6"
          >
            + สร้างการสนทนาใหม่
          </Button>
        </div>
        
        <div className="space-y-3 p-4">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 cursor-pointer hover:bg-blue-50 ${
                selectedChatId === chat.id ? 'bg-blue-100 shadow-md' : ''
              }`}
            >
              <div 
                className="flex items-center space-x-2 flex-grow"
                onClick={() => loadChat(chat.id)}
              >
                <Clock className="w-4 h-4 text-gray-500" />
                <div className="truncate max-w-[180px]">
                  <div className="font-medium">{chat.title}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(chat.timestamp).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                className="hover:bg-red-100 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}