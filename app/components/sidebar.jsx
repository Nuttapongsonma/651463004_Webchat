"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { path: '/', label: 'แชท', icon: '💬' },
    { path: '/Tag', label: 'วิเคราะห์และแนะนำแท็ก', icon: '🏷️' },
    { path: '/Imagetext', label: 'ความสัมพันธ์ระหว่างภาพและข้อความ', icon: '🖼️' },
    { path: '/Translation', label: 'แปลภาษา', icon: '🌐' },
    { path: '/FaceblurDetection', label: 'ตำแหน่งใบหน้ามนุษย์ในรูปภาพ', icon: '👤' },
    { path: '/Longantokenizer', label: 'ตัดคำและประโยคภาษาไทย', icon: '✂️' },
    { path: '/Sensing', label: 'วิเคราะห์ความคิดเห็นจากข้อความ', icon: '🎯' },
    { path: '/Thaimoji', label: 'แนะนำอิโมจิ', icon: '😊' },
    { path: '/Vaja', label: 'สังเคราะห์เสียงพูดภาษาไทย', icon: '🔊' },
  ];

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-md shadow-lg hover:bg-gray-100"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 bg-white shadow-xl border-r border-gray-200`}
      >
        <div className="h-full px-4 py-6 overflow-y-auto">
          <Link href="/" className="flex items-center mb-8 px-2 gap-3">
            <Image
              src="/img/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="rounded-lg"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              ChatBot
            </span>
          </Link>
          
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${pathname === item.path 
                    ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {pathname === item.path && (
                  <div className="w-1.5 h-8 bg-blue-600 rounded-full ml-2"></div>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="md:ml-72">
        {/* Your page content */}
      </div>
    </>
  );
};

export default Sidebar;
