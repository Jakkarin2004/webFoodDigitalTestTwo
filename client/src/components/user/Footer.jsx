import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Heart,
  ArrowUp
} from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Main Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">🍽️</span>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  ร้านอาหารป้าอ้อ
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                ร้านอาหารที่มีความหลากหลายของเมนู พร้อมบริการที่ดีที่สุด 
                เพื่อประสบการณ์การรับประทานอาหารที่น่าจดจำ
              </p>
              <div className="flex space-x-4">
                <button className="bg-orange-500 hover:bg-orange-600 p-2 rounded-full transition-colors">
                  <Facebook size={20} />
                </button>
              </div>
            </div>  
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 my-8"></div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            <div className="text-center p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700">
              <div className="text-3xl mb-3">⭐</div>
              <h5 className="font-semibold text-orange-400 mb-2">คุณภาพเยี่ยม</h5>
              <p className="text-gray-300 text-sm">วัตถุดิบสดใหม่ทุกวัน</p>
            </div>
           
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="bg-black border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-gray-400">
                <span>ร้านอาหารป้าอ้อ สงวนลิขสิทธิ์</span>
                <Heart size={16} className="text-orange-500" fill="currentColor" />
                <span>Made with love</span>
              </div>
              <div className="flex items-center space-x-6">
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">นโยบายความเป็นส่วนตัว</a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">เงื่อนไขการใช้งาน</a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">คุกกี้</a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110 z-50"
        >
          <ArrowUp size={20} />
        </button>
      </footer>
    </>
  );
};

export default Footer;