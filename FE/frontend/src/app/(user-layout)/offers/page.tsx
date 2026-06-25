// src/app/(user-layout)/offers/page.tsx
"use strict";

// 1. THÊM IMPORT: Để dùng được tương tác click, bạn cần dùng Client Component của Next.js
"use client"; 
import { useState } from "react";
import Link from "next/link";

export default function OffersPage() {
  // 2. STATE THEO DÕI TAB ĐANG CHỌN (Mặc định ban đầu là "Tất cả ưu đãi")
  const [activeTab, setActiveTab] = useState("Tất cả ưu đãi");

  
const offers = [
    { id: 1, tag: "Mùa hè rực rỡ", title: "Giảm 35% khi đặt phòng tại Phú Quốc", desc: "Áp dụng cho các booking từ 3 đêm trở lên tại resort 5 sao.", code: "SUMMER35" },
    { id: 2, tag: "Độc quyền thành viên", title: "Tặng thẻ Spa trị giá 1.500.000 VND", desc: "Ưu đãi đặc biệt dành cho chủ tài khoản VIP khi đặt phòng tuần này.", code: "VIPSPA" },
    { id: 3, tag: "Đặt sớm giá hời", title: "Ưu đãi đặt trước 45 ngày: Giảm ngay 40%", desc: "Lên kế hoạch sớm để hưởng trọn mức chiết khấu phòng đẳng cấp toàn quốc.", code: "EARLY40" },
  ];


  // Dữ liệu lưới ưu đãi chính
  const gridOffers = [
    {
      id: 1,
      type: "Đặt sớm",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      discount: "-30%",
      title: "Đặt Sớm — Ưu Đãi Lớn",
      hotelName: "Sofitel Legend Metropole Hà Nội",
      desc: "Đặt trước 30 ngày, tiết kiệm đáng kể ngân sách.",
      oldPrice: "4.200.000đ",
      newPrice: "2.940.000đ",
      expiry: "Hết hạn: 30/7/2026",
      code: "EARLY30",
    },
    {
      id: 2,
      type: "Theo mùa",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      discount: "-25%",
      title: "Mùa Hè Phú Quốc",
      hotelName: "Premier Village Phú Quốc Resort",
      desc: "Gói nghỉ dưỡng đảo Ngọc trọn vẹn trải nghiệm.",
      oldPrice: "6.900.000đ",
      newPrice: "5.175.000đ",
      expiry: "Hết hạn: 30/8/2026",
      code: "SUMMER25",
    },
    {
      id: 3,
      type: "Thành viên",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      discount: "-20%",
      title: "Ưu Đãi Thành Viên Vàng",
      hotelName: "Vinpearl Resort & Spa Nha Trang Bay",
      desc: "Độc quyền cho hội viên vàng cao cấp TrevalBooking.",
      oldPrice: "2.900.000đ",
      newPrice: "2.320.000đ",
      expiry: "Hết hạn: 30/12/2026",
      code: "MEMBER20",
    },
  ];

  // Danh sách các nhãn nút bấm tab điều hướng
  const tabs = ["Tất cả ưu đãi", "Flash Sale", "Đặt sớm", "Theo mùa", "Thành viên"];

  // 3. LOGIC LỌC DỮ LIỆU: Nếu tab là "Tất cả ưu đãi" thì giữ nguyên, ngược lại lọc theo đúng loại 'type'
  const filteredOffers = gridOffers.filter((offer) => {
    if (activeTab === "Tất cả ưu đãi") return true;
    return offer.type.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="bg-[#070c1e] text-white min-h-screen pb-20 font-sans">
      
      {/* ================= PHẦN 1: BANNER TIÊU ĐỀ ================= */}
      <section className="bg-[#0B192E] border-b border-slate-900/50 w-full pt-16 pb-16 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(#16224f_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#121b3a] border border-slate-800 px-4 py-1.5 rounded-full mb-5 shadow-inner">
            <span className="text-[#e5c158] text-xs">%</span>
            <span className="text-[#e5c158] text-xs font-semibold tracking-wider">Ưu đãi độc quyền 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-wide mb-4">
            Ưu đãi <span className="italic text-[#e5c158] font-normal">hấp dẫn</span> nhất
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Hàng trăm ưu đãi độc quyền được cập nhật hàng ngày. Đừng bỏ lỡ cơ hội nghỉ dưỡng với giá tốt nhất!
          </p>
        </div>
      </section>

      {/* ================= PHẦN 2: FLASH SALE NỔI BẬT ================= */}
      <section className="max-w-7xl mx-auto my-5 px-6 mb-16">
        <div className="flex items-center gap-2 text-xs font-bold text-[#e5c158] tracking-widest uppercase mb-4">
          <span>⚡</span> Flash Sale nổi bật
        </div>
        <div 
          className="relative rounded-3xl overflow-hidden border border-slate-800/60 bg-cover bg-center p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl h-auto md:h-[340px]"
          style={{ backgroundImage: `linear-gradient(to right, #0a1029 45%, #0a1029/40 70%, transparent), url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80')` }}
        >
          <div className="space-y-4 max-w-xl z-10">
            <div className="flex flex-wrap items-center gap-4">
              <span className="bg-[#ff4d4d] text-white font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-md">
                Flash Sale
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Kết thúc sau:</span>
                <div className="flex gap-1 items-center font-mono text-xs">
                  <span className="bg-[#1f294d] text-amber-400 px-1.5 py-0.5 rounded font-bold">02</span><span className="text-[9px] text-slate-500">ngày</span>
                  <span className="bg-[#1f294d] text-amber-400 px-1.5 py-0.5 rounded font-bold">20</span><span className="text-[9px] text-slate-500">giờ</span>
                  <span className="bg-[#1f294d] text-amber-400 px-1.5 py-0.5 rounded font-bold">05</span><span className="text-[9px] text-slate-500">phút</span>
                  <span className="bg-[#1f294d] text-amber-400 px-1.5 py-0.5 rounded font-bold">24</span><span className="text-[9px] text-slate-500">giây</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">Flash Sale Cuối Tuần</h2>
              <p className="text-sm text-slate-300 font-medium">InterContinental Danang Sun Peninsula • Đà Nẵng</p>
              <p className="text-xs text-slate-400 mt-2">Giảm giá sốc dành riêng cho 2 ngày cuối tuần</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-amber-400/90">
              <span className="bg-amber-500/5 border border-amber-500/20 px-2.5 py-1 rounded-lg">✓ Áp dụng cuối tuần</span>
              <span className="bg-amber-500/5 border border-amber-500/20 px-2.5 py-1 rounded-lg">✓ Thanh toán trước</span>
              <span className="bg-amber-500/5 border border-amber-500/20 px-2.5 py-1 rounded-lg">✓ Không hoàn hủy</span>
            </div>
            <div className="inline-flex items-center gap-3 bg-[#070c1e]/80 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono tracking-wide">
              <span className="text-slate-500">🏷️</span>
              <span className="text-white font-bold font-mono">FLASH40</span>
              <span className="text-slate-600 cursor-pointer hover:text-white">✂️</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-start md:items-end justify-center min-w-[200px] z-10 bg-black/20 md:bg-transparent p-4 md:p-0 rounded-2xl w-full md:w-auto">
            <p className="text-red-500 text-5xl md:text-6xl font-serif font-black tracking-tighter mb-1">-40%</p>
            <p className="text-xs text-slate-400 line-through tracking-wide mb-1">5.800.000đ</p>
            <p className="text-[#e5c158] text-2xl md:text-3xl font-serif font-extrabold mb-5">3.480.000đ</p>
            <button className="bg-[#e5c158] hover:bg-[#d4af37] text-black text-xs font-extrabold px-6 py-3.5 rounded-xl flex items-center gap-2 transition shadow-xl shadow-yellow-500/10 group w-full md:w-auto justify-center">
              Đặt ngay <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= PHẦN 3: LƯỚI DANH MỤC ƯU ĐÃI ================= */}
      <section className="max-w-7xl mx-auto px-6">
        
        {/* Thanh điều hướng Tab bộ lọc ngang */}
        <div className="flex flex-wrap gap-2.5 border-b border-slate-900 pb-6 mb-8">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              // 4. SỰ KIỆN CLICK: Cập nhật giá trị tab đang hoạt động khi click chuột
              onClick={() => setActiveTab(tab)}
              className={`text-xs px-4 py-2.5 rounded-xl transition font-medium ${
                activeTab === tab
                  ? "bg-[#e5c158] text-black font-bold shadow-md shadow-yellow-500/5" 
                  : "bg-[#111836] text-slate-400 hover:text-white border border-slate-800/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Lưới 3 cột hiển thị danh sách đã được lọc */}
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((item) => (
              <div 
                key={item.id} 
                className="bg-[#0f1631] border border-slate-900 rounded-3xl overflow-hidden group hover:border-slate-800/80 transition-all flex flex-col justify-between"
              >
                <div className="h-52 overflow-hidden relative flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80" alt={item.title} className="w-full h-full object-cover group-hover:scale-102 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1631] via-transparent to-black/20"></div>
                  <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border ${item.badgeColor}`}>
                    {item.type}
                  </span>
                  <span className="absolute bottom-1 right-4 text-6xl font-serif font-black text-[#e5c158]/20 tracking-tighter select-none">
                    {item.discount}
                  </span>
                </div>

                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#e5c158] transition duration-300">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#e5c158] font-medium">📍 {item.hotelName}</p>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">{item.desc}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-500 text-xs line-through">{item.oldPrice}</span>
                      <span className="text-[#e5c158] font-extrabold text-lg">{item.newPrice}</span>
                      <span className="text-[10px] text-slate-500">/đêm</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <span>🕒</span> {item.expiry}
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-4 flex justify-between items-center gap-2">
                    <div className="bg-[#070c1e] border border-slate-800/60 px-3 py-1.5 rounded-xl text-[11px] font-mono tracking-wider text-slate-400 flex items-center gap-2">
                      <span>🏷️</span> {item.code}
                    </div>
                    <Link href={`/bookings/checkout?offerCode=${item.code}&hotelName=${encodeURIComponent(item.hotelName || item.title)}&price=2500000`} className="bg-[#e5c158] hover:bg-[#d4af37] text-black text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition inline-block">
                      Đặt <span className="text-[10px]">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 5. HIỂN THỊ KHI TRỐNG: Nếu chọn tab "Flash Sale" hiện tại chưa có sản phẩm nào thuộc loại đó
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-[#0f1631]/40">
            <span className="text-3xl block mb-2">📭</span>
            <p className="text-slate-400 text-sm">Hiện tại chưa có ưu đãi nào thuộc danh mục này.</p>
          </div>
        )}
      </section>

      
<div className="max-w-5xl mx-auto px-6 py-12">
      

      <div className="space-y-6">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-[#0f1736] border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#e5c158] bg-yellow-500/10 border border-[#e5c158]/20 px-2.5 py-1 rounded-md">{offer.tag}</span>
              <h3 className="text-xl font-serif font-bold pt-1 text-white group-hover:text-[#e5c158] transition">{offer.title}</h3>
              <p className="text-slate-400 text-sm">{offer.desc}</p>
            </div>
            
            <div className="bg-[#070c1e] border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[160px] w-full md:w-auto text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Mã ưu đãi</p>
              <p className="text-white font-mono font-bold tracking-wider text-base mb-2 select-all">{offer.code}</p>
              <button className="w-full bg-[#e5c158]/10 hover:bg-[#e5c158] text-[#e5c158] hover:text-black border border-[#e5c158]/30 text-xs font-bold py-1.5 px-3 rounded-lg transition duration-300">Sao chép mã</button>
            </div>
          </div>
        ))}
      </div>
    </div>

    </div>
  );
}