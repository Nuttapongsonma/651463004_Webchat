"Use client";
import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg mb-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <a href="/" className="text-xl font-bold">
                ChatBot
              </a>
            </div>
            <div className="hidden md:flex md:ml-6">
              <a
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                เเชท
              </a>
              <a
                href="/Tag"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                วิเคราะห์แท็ก
              </a>
              <a
                href="/calculator"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                เครื่องคิดเลข
              </a>
              <a
                href="/SSense"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                วิเคราะห์ความคิดเห็นจากข้อความ
              </a>
              <a
                href="/EmoNews"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                ทำนายอารมณ์
              </a>
              <a
                href="/Cyber_Bully"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                ตรวจสอบการรังแกในโลกไซเบอร์
              </a>
              <a
                href="/TLex"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                ตัดคํา
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;