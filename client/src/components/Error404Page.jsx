import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function Error404Page() {
  const [isFloating, setIsFloating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFloating(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-20 left-20 w-32 h-32 bg-orange-200 rounded-full opacity-60 blur-xl"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        />
        <div 
          className="absolute bottom-20 right-20 w-40 h-40 bg-amber-200 rounded-full opacity-40 blur-2xl"
          style={{
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`
          }}
        />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-orange-300 rounded-full opacity-30 blur-lg animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 
            className={`text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-transparent transition-transform duration-3000 ${isFloating ? 'transform scale-105' : 'transform scale-100'}`}
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(251, 146, 60, 0.3))',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            404
          </h1>
        </div>

        {/* Floating Icon */}
        <div className={`mb-8 transition-transform duration-1000 ${isFloating ? 'transform -translate-y-4' : 'transform translate-y-0'}`}>
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Search className="w-12 h-12 text-white animate-pulse" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-12 max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-800 mb-4">
            ไม่พบหน้าที่คุณต้องการ
          </h2>
          <p className="text-lg text-orange-700 leading-relaxed">
            ขออภัย หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่จริง
            <br />
            <span className="text-orange-600 font-medium">ลองตรวจสอบ URL อีกครั้ง หรือกลับไปหน้าหลัก</span>
          </p>
        </div>



        {/* Decorative Elements */}
        <div className="mt-16 flex gap-2">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
          <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20 fill-orange-200 opacity-50">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </div>
  );
}