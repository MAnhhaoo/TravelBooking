"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getVouchersAPI } from "../../../services/api";
import { formatCurrencyVND } from "../../../utils/dataMappers";

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState("Tất cả ưu đãi");
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Tải danh sách voucher từ hệ thống
  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      try {
        const data = await getVouchersAPI({ status: 1 });
        setVouchers(data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách ưu đãi/voucher:", error);
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  const handleCopyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const tabs = ["Tất cả ưu đãi", "Toàn hệ thống", "Khách sạn độc quyền", "Giảm theo %", "Tiền mặt cố định"];

  // Lọc voucher theo tab
  const filteredVouchers = vouchers.filter((v) => {
    if (activeTab === "Tất cả ưu đãi") return true;
    if (activeTab === "Toàn hệ thống") return !v.hotel_id;
    if (activeTab === "Khách sạn độc quyền") return !!v.hotel_id;
    if (activeTab === "Giảm theo %") return v.discount_type === "PERCENT";
    if (activeTab === "Tiền mặt cố định") return v.discount_type === "FIXED";
    return true;
  });

  // Chọn 1 voucher nổi bật nhất cho Flash Sale (ưu tiên PERCENT hoặc giảm nhiều nhất)
  const featuredVoucher = vouchers.length > 0 
    ? vouchers.reduce((max, current) => (Number(current.discount_value || 0) > Number(max.discount_value || 0) ? current : max), vouchers[0])
    : {
        code: "FLASH50",
        discount_type: "PERCENT",
        discount_value: 35,
        max_discount: 500000,
        min_order_value: 1000000,
        end_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        hotel_id: null,
        hotels: null,
      };

  return (
    <div className="bg-[#070c1e] text-white min-h-screen pb-24 font-sans selection:bg-yellow-500 selection:text-black">
      
      {/* ================= PHẦN 1: BANNER TIÊU ĐỀ ================= */}
      <section className="bg-gradient-to-b from-[#0B192E] via-[#0E1A38] to-[#070c1e] border-b border-slate-900/60 w-full pt-16 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e295d_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
        
        {/* Glowing Orb */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#121b3a]/90 border border-yellow-500/30 px-4 py-1.5 rounded-full mb-5 shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <span className="text-[#e5c158] text-xs font-bold tracking-wider uppercase">Kho Voucher & Ưu đãi Hệ Thống</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-light tracking-wide mb-4 text-white">
            Khám phá Mã Ưu Đãi <span className="italic text-[#e5c158] font-semibold drop-shadow-[0_2px_15px_rgba(229,193,88,0.3)]">Độc Quyền</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light">
            Toàn bộ mã giảm giá từ hệ thống và các khách sạn đối tác được cập nhật thời gian thực. Sao chép mã và áp dụng ngay khi thanh toán để tiết kiệm tối đa cho kỳ nghỉ của bạn!
          </p>
        </div>
      </section>

      {/* ================= PHẦN 2: FLASH SALE / VOUCHER NỔI BẬT ================= */}
      <section className="max-w-7xl mx-auto -mt-6 px-6 mb-16 relative z-20">
        <div className="flex items-center gap-2 text-xs font-bold text-[#e5c158] tracking-widest uppercase mb-4">
          <span className="text-base animate-bounce">⚡</span> Voucher Khủng Nổi Bật Nhất Hôm Nay
        </div>

        <div 
          className="relative rounded-3xl overflow-hidden border border-yellow-500/40 bg-[#0d1636] p-6 md:p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shadow-2xl shadow-yellow-500/5 backdrop-blur-xl"
          style={{ backgroundImage: `radial-gradient(circle at 90% 20%, rgba(229, 193, 88, 0.15) 0%, transparent 60%), linear-gradient(to right, #0d1636 60%, #0d1636/90 100%)` }}
        >
          {/* Decorative Circle Ribbon */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 border-2 border-dashed border-yellow-500/20 rounded-full pointer-events-none"></div>

          <div className="space-y-4 max-w-2xl z-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-[11px] tracking-wider uppercase px-3.5 py-1.5 rounded-xl shadow-md">
                🔥 VOUCHER HOT NHẤT
              </span>
              {!featuredVoucher.hotel_id ? (
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-xl">
                  🌐 Áp dụng Toàn Hệ Thống
                </span>
              ) : (
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold px-3 py-1 rounded-xl">
                  🏨 Độc quyền: {featuredVoucher.hotels?.hotel_name || "Khách sạn đối tác"}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight">
                {featuredVoucher.discount_type === "PERCENT" 
                  ? `Giảm ${featuredVoucher.discount_value}% Tổng Giá Trị Đơn Đặt Phòng`
                  : `Giảm Trực Tiếp ${formatCurrencyVND(Number(featuredVoucher.discount_value || 0))} Khi Đặt Phòng`}
              </h2>
              <p className="text-slate-300 text-sm md:text-base mt-2">
                Đơn tối thiểu từ <strong className="text-yellow-400 font-mono">{formatCurrencyVND(Number(featuredVoucher.min_order_value || 0))}</strong>. 
                {featuredVoucher.discount_type === "PERCENT" && featuredVoucher.max_discount ? ` Mức giảm tối đa lên tới ${formatCurrencyVND(Number(featuredVoucher.max_discount))}.` : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1 text-xs text-slate-300">
              <span className="bg-[#14224e] border border-blue-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <span>🕒</span> Hạn dùng: <strong>{featuredVoucher.end_date ? new Date(featuredVoucher.end_date).toLocaleDateString("vi-VN") : "31/12/2026"}</strong>
              </span>
              <span className="bg-[#14224e] border border-blue-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <span>⚡</span> Còn lại: <strong>{Math.max(0, Number(featuredVoucher.usage_limit || 100) - Number(featuredVoucher.used_count || 0))} lượt</strong>
              </span>
            </div>
          </div>

          {/* Code Copy Box */}
          <div className="bg-[#080e24] border-2 border-dashed border-yellow-500/60 p-6 rounded-2xl w-full lg:w-80 shrink-0 flex flex-col items-center justify-center text-center shadow-2xl relative group">
            <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">MÃ VOUCHER ĐẶC BIỆT</span>
            <div className="font-mono text-3xl md:text-4xl font-black text-[#e5c158] tracking-wider py-2 select-all drop-shadow">
              {featuredVoucher.code}
            </div>
            
            <button
              onClick={() => handleCopyCode(featuredVoucher.code)}
              className="mt-3 w-full bg-gradient-to-r from-[#e5c158] to-amber-500 hover:brightness-110 active:scale-95 text-black font-extrabold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedCode === featuredVoucher.code ? (
                <>
                  <span className="text-base">✓</span> Đã sao chép vào bộ nhớ!
                </>
              ) : (
                <>
                  <span>✂️</span> Sao chép mã ngay
                </>
              )}
            </button>

            <Link
              href={featuredVoucher.hotel_id ? `/hotel/${featuredVoucher.hotel_id}` : "/hotel"}
              className="mt-2.5 text-xs text-slate-400 hover:text-white underline font-medium transition"
            >
              Tìm phòng áp dụng voucher này →
            </Link>
          </div>
        </div>
      </section>

      {/* ================= PHẦN 3: LƯỚI DANH SÁCH VOUCHER ================= */}
      <section className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold font-serif text-white">Danh Sách Voucher Hiện Có</h2>
            <p className="text-xs text-slate-400 mt-1">
              Chọn và sao chép mã giảm giá phù hợp với hành trình và khách sạn bạn muốn lưu trú
            </p>
          </div>

          {/* Thanh điều hướng Tab ngang */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(tab)}
                className={`text-xs px-4 py-2.5 rounded-xl transition font-semibold cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#e5c158] text-slate-950 font-extrabold shadow-lg shadow-yellow-500/10 scale-105"
                    : "bg-[#111c38] text-slate-300 hover:text-white hover:bg-[#1a2952] border border-blue-900/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Trạng thái Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">Đang tải dữ liệu voucher từ hệ thống...</p>
          </div>
        ) : filteredVouchers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVouchers.map((v) => {
              const isGlobal = !v.hotel_id;
              const isPercent = v.discount_type === "PERCENT";
              const discountText = isPercent 
                ? `-${v.discount_value}%`
                : `-${Number(v.discount_value || 0).toLocaleString()}đ`;

              const minOrderText = v.min_order_value 
                ? `Đơn từ ${Number(v.min_order_value).toLocaleString()}đ` 
                : "Không yêu cầu đơn tối thiểu";

              const maxDiscountText = isPercent && v.max_discount 
                ? `Giảm tối đa ${Number(v.max_discount).toLocaleString()}đ`
                : null;

              const hotelTitle = isGlobal 
                ? "🌐 Toàn Hệ Thống" 
                : `🏨 Khách sạn: ${v.hotels?.hotel_name || "Khách sạn đối tác"}`;

              const usageLeft = Math.max(0, Number(v.usage_limit || 0) - Number(v.used_count || 0));
              const usagePercent = Math.min(100, (Number(v.used_count || 0) / Number(v.usage_limit || 1)) * 100);

              const isCopied = copiedCode === v.code;

              return (
                <div 
                  key={v.voucher_id || v.code}
                  className="bg-[#0f1736] border border-blue-900/40 hover:border-yellow-500/50 rounded-3xl overflow-hidden group transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:-translate-y-1 relative"
                >
                  {/* Perforated ticket circles at edges */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#070c1e] rounded-full border-r border-blue-900/40 z-10 pointer-events-none"></div>
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#070c1e] rounded-full border-l border-blue-900/40 z-10 pointer-events-none"></div>

                  {/* Header box of Ticket */}
                  <div className="bg-gradient-to-r from-[#14234e] to-[#111c38] p-6 pb-5 border-b border-dashed border-blue-900/60 relative">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg border ${
                        isGlobal 
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
                          : "bg-purple-500/20 text-purple-300 border-purple-500/30 truncate max-w-[180px]"
                      }`}>
                        {isGlobal ? "Voucher Hệ Thống" : "Khách sạn độc quyền"}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {isPercent ? "Giảm theo %" : "Tiền mặt"}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <div className="text-3xl font-black font-mono tracking-tight text-yellow-400">
                          {discountText}
                        </div>
                        <div className="text-xs text-slate-300 font-medium mt-1 truncate">
                          {hotelTitle}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body conditions */}
                  <div className="p-6 pt-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
                    <div className="space-y-2 text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">✓</span>
                        <span className="font-semibold text-white">{minOrderText}</span>
                      </div>
                      {maxDiscountText && (
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">✓</span>
                          <span>{maxDiscountText}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>🕒</span>
                        <span>Hạn: {v.end_date ? new Date(v.end_date).toLocaleDateString("vi-VN") : "31/12/2026"}</span>
                      </div>
                    </div>

                    {/* Progress bar of usage */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1.5">
                        <span>Đã dùng: {v.used_count || 0} / {v.usage_limit || 0}</span>
                        <span className="text-yellow-400 font-bold">Còn {usageLeft} lượt</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Code & Copy button */}
                    <div className="pt-3 border-t border-blue-900/30 flex items-center gap-3">
                      <div className="flex-1 bg-[#080e24] border border-blue-500/30 rounded-xl py-2.5 px-3 text-center font-mono font-extrabold text-base tracking-wider text-white truncate">
                        {v.code}
                      </div>

                      <button
                        onClick={() => handleCopyCode(v.code)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs transition duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isCopied 
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                            : "bg-[#e5c158] hover:bg-yellow-400 text-slate-950 shadow-md"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <span>✓</span> Đã chép
                          </>
                        ) : (
                          <>
                            <span>✂️</span> Sao chép
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center pt-1">
                      <Link 
                        href={v.hotel_id ? `/hotel/${v.hotel_id}` : "/hotel"}
                        className="text-[11px] text-slate-400 hover:text-yellow-400 transition underline"
                      >
                        Tìm khách sạn để áp dụng mã này →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-blue-900/60 rounded-3xl bg-[#0f1736]/40 max-w-2xl mx-auto space-y-4">
            <span className="text-5xl block">📭</span>
            <h3 className="text-lg font-bold text-white">Chưa Có Voucher Nào Theo Bộ Lọc Này</h3>
            <p className="text-slate-400 text-sm">
              Hiện tại không có mã ưu đãi nào thuộc danh mục "{activeTab}". Bạn vui lòng chọn tab khác hoặc quay lại sau nhé!
            </p>
            <button
              onClick={() => setActiveTab("Tất cả ưu đãi")}
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl transition"
            >
              Xem tất cả voucher hệ thống
            </button>
          </div>
        )}
      </section>

      {/* ================= PHẦN 4: HƯỚNG DẪN SỬ DỤNG VOUCHER ================= */}
      <section className="max-w-5xl mx-auto px-6 mt-20">
        <div className="bg-[#0f1736] border border-blue-900/50 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <h3 className="text-xl md:text-2xl font-serif font-bold text-white text-center mb-8">
            💡 Cách Áp Dụng Mã Ưu Đãi Khi Đặt Phòng
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-3 bg-[#070c1e]/60 p-6 rounded-2xl border border-blue-900/30">
              <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center text-xl text-yellow-400 mx-auto font-black">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Chọn & Sao Chép Mã</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lựa chọn mã voucher phù hợp với khách sạn bạn muốn lưu trú và nhấn nút <strong className="text-yellow-400">"Sao chép"</strong>.
              </p>
            </div>

            <div className="space-y-3 bg-[#070c1e]/60 p-6 rounded-2xl border border-blue-900/30">
              <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center text-xl text-yellow-400 mx-auto font-black">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Chọn Phòng & Điền Thông Tin</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Khám phá danh sách phòng tại khách sạn, chọn ngày Check-in / Check-out và đi tới trang <strong className="text-yellow-400">Thanh toán (Checkout)</strong>.
              </p>
            </div>

            <div className="space-y-3 bg-[#070c1e]/60 p-6 rounded-2xl border border-blue-900/30">
              <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center text-xl text-yellow-400 mx-auto font-black">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Dán Mã & Hưởng Chiết Khấu</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dán mã vào ô <strong className="text-yellow-400">"Mã ưu đãi / Voucher"</strong> tại bước Tóm tắt đơn đặt phòng và nhấn <strong className="text-yellow-400">"Áp dụng"</strong> để trừ tiền ngay lập tức.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}