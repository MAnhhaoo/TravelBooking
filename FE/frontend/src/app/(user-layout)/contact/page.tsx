// src/app/(user-layout)/contact/page.tsx
"use client";

import { useState } from "react";

export default function ContactPage() {
  // Quản lý trạng thái đóng/mở câu hỏi FAQ (Mặc định mở câu đầu tiên như hình)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const contactMethods = [
    {
      icon: "📞",
      title: "HOTLINE MIỄN PHÍ",
      value: "1900 2222",
      sub: "24/7, 365 ngày/năm",
    },
    {
      icon: "💬",
      title: "LIVE CHAT",
      value: "Chat ngay",
      sub: "Phản hồi trong 2 phút",
    },
    {
      icon: "✉️",
      title: "EMAIL HỖ TRỢ",
      value: "support@trevalbooking.vn",
      sub: "Phản hồi trong 4 giờ",
    },
  ];

  const offices = [
    {
      title: "TP. Hồ Chí Minh (Trụ sở chính)",
      address: "Tầng 18, 285 Cách Mạng Tháng 8, Quận 10",
      phone: "028 3868 1234",
      time: "T2–T6: 8:00–18:00",
    },
    {
      title: "Hà Nội",
      address: "Tầng 12, 72 Trần Hưng Đạo, Hoàn Kiếm",
      phone: "024 3928 5678",
      time: "T2–T6: 8:00–18:00",
    },
    {
      title: "Đà Nẵng",
      address: "Tầng 5, 112 Nguyễn Văn Linh, Hải Châu",
      phone: "0236 3856 789",
      time: "T2–T6: 8:00–17:00",
    },
  ];

  const faqs = [
    {
      question: "Làm thế nào để hủy đặt phòng?",
      answer: "Bạn có thể hủy phòng miễn phí trong vòng 48 giờ trước ngày nhận phòng thông qua tài khoản của bạn hoặc liên hệ hotline 1900 2222. Sau thời gian này, chính sách hoàn tiền sẽ theo quy định của từng khách sạn.",
    },
    {
      question: "Tôi có thể thay đổi ngày đặt phòng không?",
      answer: "Có, tùy thuộc vào tình trạng phòng trống của khách sạn. Vui lòng liên hệ bộ phận chăm sóc khách hàng càng sớm càng tốt để được hỗ trợ thay đổi lịch trình.",
    },
    {
      question: "Phương thức thanh toán nào được chấp nhận?",
      answer: "Chúng tôi chấp nhận nhiều phương thức thanh toán an toàn bao gồm thẻ tín dụng (Visa/Mastercard), chuyển khoản ngân hàng qua mã QR, và ví điện tử nội địa.",
    },
    {
      question: "Làm sao để trở thành hội viên TrevalBooking?",
      answer: "Bạn chỉ cần đăng ký tài khoản trên website. Hệ thống sẽ tự động tích lũy điểm thưởng từ mỗi lần đặt phòng để nâng hạng thành viên Bạc, Vàng, Kim Cương.",
    },
    {
      question: "Giá trên website có bao gồm thuế không?",
      answer: "Tất cả mức giá hiển thị cuối cùng trên TrevalBooking đều đã bao gồm thuế giá trị gia tăng (VAT) và phí phục vụ, đảm bảo minh bạch, không chi phí ẩn.",
    },
  ];

  return (
    <div className="bg-[#070c1e] text-white min-h-screen pb-24 font-sans selection:bg-[#e5c158]/30">
      
      {/* ================= PHẦN 1: BANNER HỖ TRỢ ĐẦU TRANG (ĐÃ TĂNG PY) ================= */}
      <section 
        className="relative text-center pt-36 pb-28 px-6 bg-cover bg-center border-b border-slate-900/40"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(7, 12, 30, 0.85), #070c1e), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop&q=80')` 
        }}
      >
        <div className="max-w-7xl mx-auto">
          <span className="text-[#e5c158] text-xs uppercase tracking-widest font-bold block mb-4">HỖ TRỢ 24/7</span>
          <h1 className="text-4xl md:text-6xl font-serif font-light mb-6 tracking-wide leading-tight">
            Chúng tôi luôn <span className="italic text-[#e5c158] font-normal">sẵn sàng</span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed mb-20">
            Đội ngũ hỗ trợ của TrevalBooking luôn sẵn sàng giải đáp mọi thắc mắc và hỗ trợ bạn trong suốt hành trình nghỉ dưỡng.
          </p>

          {/* 3 Khối thông tin liên hệ nhanh (ĐÃ TĂNG SIZE TỔNG THỂ) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {contactMethods.map((method, idx) => (
              <div key={idx} className="bg-[#0f1731]/80 border border-slate-800/60 backdrop-blur-sm rounded-3xl p-8 flex flex-col items-center justify-center min-h-[180px] hover:border-slate-700/50 transition shadow-xl">
                <div className="text-4xl mb-4 text-slate-300">{method.icon}</div>
                <span className="text-xs text-slate-500 font-bold tracking-wider uppercase mb-2">{method.title}</span>
                <span className="text-[#e5c158] font-bold text-xl mb-1.5">{method.value}</span>
                <span className="text-slate-400 text-xs font-medium">{method.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PHẦN 2: FORM LIÊN HỆ & VĂN PHÒNG ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Khối bên trái: Form gửi tin nhắn (ĐÃ PHÓNG TO CÁC INPUT VÀ TEXT) */}
        <div className="lg:col-span-7 bg-[#0f1731]/50 border border-slate-900 rounded-3xl p-8 md:p-10 shadow-lg">
          <h2 className="text-2xl font-serif font-medium mb-8 tracking-wide">Gửi tin nhắn cho chúng tôi</h2>
          
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Họ và tên *</label>
                <input type="text" placeholder="Nguyễn Văn A" className="w-full bg-[#161f3d] border border-slate-800 rounded-xl px-5 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition" required />
              </div>
              <div className="space-y-2.5">
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Số điện thoại</label>
                <input type="tel" placeholder="0901 234 567" className="w-full bg-[#161f3d] border border-slate-800 rounded-xl px-5 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email *</label>
              <input type="email" placeholder="email@example.com" className="w-full bg-[#161f3d] border border-slate-800 rounded-xl px-5 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition" required />
            </div>

            <div className="space-y-2.5">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Chủ đề</label>
              <div className="relative">
                <select className="w-full bg-[#161f3d] border border-slate-800 rounded-xl px-5 py-4 text-base text-white focus:outline-none focus:border-slate-700 transition appearance-none cursor-pointer pr-10">
                  <option>Thắc mắc chung</option>
                  <option>Hỗ trợ đặt phòng</option>
                  <option>Yêu cầu hoàn tiền</option>
                  <option>Hợp tác kinh doanh</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 text-xs">▼</div>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tin nhắn *</label>
              <textarea rows={5} placeholder="Mô tả vấn đề của bạn..." className="w-full bg-[#161f3d] border border-slate-800 rounded-xl px-5 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition resize-none" required></textarea>
            </div>

            <button type="submit" className="w-full bg-[#e5c158] hover:bg-[#d4af37] text-black text-sm font-bold py-4.5 rounded-xl flex items-center justify-center gap-2 transition tracking-wider uppercase shadow-xl shadow-yellow-500/10 mt-2">
              <span className="text-base">✈</span> Gửi tin nhắn ngay
            </button>
          </form>
        </div>

        {/* Khối bên phải: Danh sách văn phòng & Map mini */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-2xl font-serif font-medium mb-8 tracking-wide pl-2">Văn phòng của chúng tôi</h2>
          
          {offices.map((office, idx) => (
            <div key={idx} className="bg-[#0f1731]/50 border border-slate-900 rounded-2xl p-6 md:p-7 space-y-3.5 shadow-md">
              <h3 className="font-serif font-bold text-base text-slate-200">{office.title}</h3>
              <div className="text-sm text-slate-400 space-y-2 font-sans leading-relaxed">
                <p className="flex items-start gap-2.5"><span className="text-amber-500/80 mt-0.5">📍</span> {office.address}</p>
                <p className="flex items-center gap-2.5"><span className="text-amber-500/80">📞</span> {office.phone}</p>
                <p className="flex items-center gap-2.5"><span className="text-amber-500/80">🕒</span> {office.time}</p>
              </div>
            </div>
          ))}

          {/* Bản đồ định vị đồ họa giả lập (ĐÃ TĂNG CHIỀU CAO H-220PX) */}
          <div className="bg-[#0f1731]/50 border border-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-[220px] relative overflow-hidden group shadow-md">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#16203d_1px,transparent_1px),linear-gradient(to_bottom,#16203d_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="text-amber-500 text-2xl animate-bounce">📍</div>
              <p className="text-sm font-serif font-bold text-slate-300">Tầng 18, 285 Cách Mạng Tháng 8</p>
              <p className="text-xs text-slate-500 font-sans">Quận 10, TP. Hồ Chí Minh</p>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-block bg-[#16203d] border border-slate-800 text-xs text-amber-400 px-6 py-2.5 rounded-xl hover:bg-amber-500 hover:text-black font-semibold transition shadow-md"
              >
                Xem trên Google Maps ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PHẦN 3: ACCORDION CÂU HỎI THƯỜNG GẶP (FAQ) ================= */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900/60">
        <div className="text-center mb-12">
          <span className="text-[#e5c158] text-xs uppercase tracking-widest font-bold block mb-2">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-serif font-light tracking-wide">Câu hỏi <span className="italic text-[#e5c158] font-normal">thường gặp</span></h2>
        </div>

        {/* ĐÃ TĂNG CỠ CHỮ CỦA TIÊU ĐỀ VÀ NỘI DUNG FAQ */}
        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-[#0f1731]/50 border border-slate-900 rounded-2xl overflow-hidden transition-colors shadow-sm">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left text-base font-medium font-serif hover:text-[#e5c158] transition"
                >
                  <span className={isOpen ? "text-[#e5c158]" : "text-white"}>{item.question}</span>
                  <span className={`text-xs text-slate-500 transform transition-transform duration-200 ${isOpen ? "rotate-180 text-[#e5c158]" : ""}`}>
                    ▼
                  </span>
                </button>
                
                {/* Nội dung câu trả lời bung ra rộng rãi hơn */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-48 border-t border-slate-900/60" : "max-h-0"}`}>
                  <p className="p-6 text-sm text-slate-400 leading-relaxed font-sans bg-[#0c1229]/40">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}