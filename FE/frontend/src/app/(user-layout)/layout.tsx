// src/app/(user-layout)/layout.tsx

import Link from "next/link";
import Header from "./Header";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#070c1e] min-h-screen flex flex-col justify-between text-white font-sans">
      <Header />

      {/* ================= NỘI DUNG TRANG CHỦ / TRANG CON ================= */}
      <main className="flex-grow">{children}</main>

      {/* ================= FOOTER CHÂN TRANG THEO THIẾT KẾ FIGMA ================= */}
      <footer className="bg-[#050a1a] border-t border-slate-950 text-slate-400 text-sm pt-16 pb-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Cột 1: Giới thiệu */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#e5c158] flex items-center justify-center text-black font-bold text-xs">T</div>
              <span className="text-xl font-bold text-white font-serif">
                Treval<span className="text-[#e5c158]">Booking</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Nền tảng đặt phòng khách sạn hàng đầu Việt Nam. Chúng tôi kết nối bạn với hàng nghìn khách sạn cao cấp trên khắp cả nước.
            </p>
            {/* Các icon mạng xã hội hình tròn viền mờ */}
            <div className="flex gap-3 pt-2">
              {["f", "i", "t", "y"].map((item, idx) => (
                <span key={idx} className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-xs text-slate-500 hover:border-[#e5c158] hover:text-[#e5c158] cursor-pointer transition">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Cột 2: Danh sách Dịch vụ */}
          <div>
            <h4 className="text-white font-serif font-semibold text-base mb-4 text-[#e5c158]">Dịch vụ</h4>
            <ul className="space-y-2.5 text-xs">
              {["Đặt phòng khách sạn", "Thuê căn hộ", "Resort cao cấp", "Biệt thự nghỉ dưỡng", "Tour du lịch", "Vé máy bay"].map((text) => (
                <li key={text} className="hover:text-white cursor-pointer transition">{text}</li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Điểm đến */}
          <div>
            <h4 className="text-white font-serif font-semibold text-base mb-4 text-[#e5c158]">Điểm đến nổi bật</h4>
            <ul className="space-y-2.5 text-xs grid grid-cols-2 gap-x-2">
              {["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hội An", "Phú Quốc", "Nha Trang", "Sapa", "Hạ Long"].map((text) => (
                <li key={text} className="hover:text-white cursor-pointer transition mb-2">{text}</li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Thông tin liên hệ */}
          <div className="space-y-4">
            <h4 className="text-white font-serif font-semibold text-base mb-4 text-[#e5c158]">Liên hệ</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2">📍 <span className="leading-relaxed">Tầng 18, 285 Cách Mạng Tháng 8, Quận 10, TP. HCM</span></li>
              <li className="flex items-center gap-2">📞 <span className="text-slate-200 font-semibold">1900 2222 (Miễn phí)</span></li>
              <li className="flex items-center gap-2">✉️ <span>support@trevalbooking.vn</span></li>
            </ul>

            {/* Khung nhập email nhận ưu đãi */}
            <div className="bg-[#0f1631] border border-slate-800 p-4 rounded-xl space-y-2 mt-4">
              <label className="block text-xs font-bold text-[#e5c158]">Nhận ưu đãi độc quyền</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email của bạn" 
                  className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 text-white outline-none flex-1 placeholder-slate-600 focus:border-slate-700" 
                />
                <button className="bg-[#e5c158] hover:bg-[#d4af37] text-black text-xs font-bold px-3 py-2 rounded-lg transition">
                  OK
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Dòng bản quyền dưới đáy */}
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-900/60 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 TrevalBooking. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer transition">Chính sách bảo mật</span>
            <span className="hover:text-slate-400 cursor-pointer transition">Điều khoản sử dụng</span>
          </div>
        </div>
      </footer>

    </div>
  );
}