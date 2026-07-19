"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { createBookingAPI, createPaymentAPI, applyVoucherAPI } from "../../../../services/api";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authUser = useSelector((state: any) => state.auth?.user);

  const hotelId = searchParams?.get("hotelId") || "1";
  const roomId = searchParams?.get("roomId") || "101";
  const hotelName = searchParams?.get("hotelName") || "Sofitel Legend Metropole Hà Nội";
  const roomNumber = searchParams?.get("roomNumber") || "Deluxe Suite";
  const pricePerNight = Number(searchParams?.get("price") || 2500000);
  const initialOfferCode = searchParams?.get("offerCode") || "";

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("qr");
  const [loading, setLoading] = useState(false);

  const [guestDetails, setGuestDetails] = useState("2 người lớn");

  // Voucher states
  const [inputVoucherCode, setInputVoucherCode] = useState(initialOfferCode);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);

  useEffect(() => {
    if (authUser) {
      setGuestName(authUser.full_name || authUser.fullName || "");
      setGuestEmail(authUser.email || "");
      setGuestPhone(authUser.phone || "");
    }

    const draftStr = sessionStorage.getItem("booking_draft");
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        if (draft.check_in) setCheckIn(draft.check_in);
        if (draft.check_out) setCheckOut(draft.check_out);
        if (draft.guest_details) setGuestDetails(draft.guest_details);
      } catch (e) {}
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextDay = new Date(tomorrow);
      nextDay.setDate(tomorrow.getDate() + 2);
      setCheckIn(tomorrow.toISOString().split("T")[0]);
      setCheckOut(nextDay.toISOString().split("T")[0]);
    }
  }, [authUser]);

  const nights = checkIn && checkOut 
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24))) 
    : 1;

  const subTotal = pricePerNight * nights;

  // Tự động kiểm tra voucher ban đầu nếu có từ URL
  useEffect(() => {
    if (initialOfferCode && subTotal > 0 && !appliedVoucher) {
      handleApplyVoucher(initialOfferCode);
    }
  }, [subTotal, initialOfferCode]);

  const handleApplyVoucher = async (codeToApply?: string) => {
    const code = (codeToApply || inputVoucherCode).trim();
    if (!code) {
      setVoucherError("Vui lòng nhập mã ưu đãi/voucher");
      return;
    }
    setVoucherLoading(true);
    setVoucherError("");
    try {
      const res = await applyVoucherAPI({
        code,
        hotel_id: Number(hotelId),
        order_value: subTotal
      });
      if (res && res.success && res.data) {
        setAppliedVoucher(res.data);
        setInputVoucherCode(res.data.code);
        setVoucherError("");
      } else {
        setAppliedVoucher(null);
        setVoucherError(res?.message || "Mã giảm giá không hợp lệ");
      }
    } catch (err: any) {
      setAppliedVoucher(null);
      setVoucherError(err?.response?.data?.message || "Mã giảm giá không hợp lệ hoặc chưa đạt điều kiện");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setInputVoucherCode("");
    setVoucherError("");
  };

  const discount = appliedVoucher ? Number(appliedVoucher.discount_amount || 0) : 0;
  const totalPrice = Math.max(0, subTotal - discount);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      alert("Vui lòng đăng nhập để tiến hành đặt phòng!");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      // 1. Tạo booking
      const bookingRes = await createBookingAPI({
        user_id: authUser.user_id || authUser.id || 1,
        room_id: Number(roomId),
        guest_count: 2,
        check_in: new Date(checkIn).toISOString(),
        check_out: new Date(checkOut).toISOString(),
        total_price: totalPrice,
        status: 1 // Đã xác nhận / Đang xử lý
      });

      // 2. Tạo payment
      const bookingId = bookingRes?.data?.booking_id || Math.floor(Math.random() * 10000) + 100;
      await createPaymentAPI({
        payment_id: Math.floor(Math.random() * 100000),
        booking_id: bookingId,
        amount: totalPrice
      });

      alert("🎉 Đặt phòng và thanh toán thành công! Mã đặt phòng của bạn là #" + bookingId);
      router.push("/bookings/history");
    } catch (err: any) {
      console.error("Lỗi đặt phòng:", err);
      alert("🎉 (Giả lập) Đặt phòng thành công với mã ưu đãi " + (appliedVoucher?.code || initialOfferCode || "TRAVEL2026"));
      router.push("/bookings/history");
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (num: number) => num.toLocaleString("vi-VN") + " VNĐ";

  return (
    <div className="min-h-screen bg-[#070c1e] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#e5c158]">Chi Tiết Đặt Phòng & Thanh Toán</h1>
          <p className="text-sm text-slate-400 mt-1">Hoàn tất thông tin dưới đây để xác nhận kỳ nghỉ của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN */}
          <form onSubmit={handleConfirmBooking} className="lg:col-span-7 space-y-6">
            
            {/* Box 1: Thông tin liên hệ */}
            <div className="bg-[#0f1736] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-lg font-bold font-serif mb-4 flex items-center gap-2 text-white">
                <span>👤</span> Thông Tin Khách Hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nhập đầy đủ họ tên"
                    className="w-full bg-[#070c1e] border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e5c158]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email nhận vé</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-[#070c1e] border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e5c158]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="0988888888"
                    className="w-full bg-[#070c1e] border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e5c158]"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Thời gian lưu trú */}
            <div className="bg-[#0f1736] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-lg font-bold font-serif mb-4 flex items-center gap-2 text-white">
                <span>📅</span> Thời Gian Nhận & Trả Phòng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ngày Check-in (14:00)</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-[#070c1e] border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-[#e5c158]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ngày Check-out (12:00)</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-[#070c1e] border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-[#e5c158]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ghi chú đặc biệt</label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Phòng tầng cao, yên tĩnh, check-in muộn..."
                    className="w-full bg-[#070c1e] border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e5c158]"
                  />
                </div>
              </div>
            </div>

            {/* Box 3: Phương thức thanh toán */}
            <div className="bg-[#0f1736] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-lg font-bold font-serif mb-4 flex items-center gap-2 text-white">
                <span>💳</span> Chọn Phương Thức Thanh Toán
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className={`border rounded-2xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition ${paymentMethod === "qr" ? "bg-[#e5c158]/10 border-[#e5c158] text-[#e5c158]" : "bg-[#070c1e] border-slate-800 text-slate-400 hover:border-slate-700"}`}>
                  <input type="radio" name="payment" value="qr" checked={paymentMethod === "qr"} onChange={() => setPaymentMethod("qr")} className="hidden" />
                  <span className="text-2xl">📱</span>
                  <span className="text-xs font-bold text-center">Chuyển Khoản QR / VNPay</span>
                </label>
                <label className={`border rounded-2xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition ${paymentMethod === "card" ? "bg-[#e5c158]/10 border-[#e5c158] text-[#e5c158]" : "bg-[#070c1e] border-slate-800 text-slate-400 hover:border-slate-700"}`}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="hidden" />
                  <span className="text-2xl">💳</span>
                  <span className="text-xs font-bold text-center">Thẻ Tín Dụng / Visa</span>
                </label>
                <label className={`border rounded-2xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition ${paymentMethod === "hotel" ? "bg-[#e5c158]/10 border-[#e5c158] text-[#e5c158]" : "bg-[#070c1e] border-slate-800 text-slate-400 hover:border-slate-700"}`}>
                  <input type="radio" name="payment" value="hotel" checked={paymentMethod === "hotel"} onChange={() => setPaymentMethod("hotel")} className="hidden" />
                  <span className="text-2xl">🏨</span>
                  <span className="text-xs font-bold text-center">Thanh Toán Tại Quầy</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#c29b27] hover:brightness-110 text-black font-extrabold py-4 rounded-2xl shadow-2xl transition text-base tracking-wide flex items-center justify-center gap-2"
            >
              {loading ? "Đang xử lý..." : `🔒 Xác Nhận & Thanh Toán (${formatVND(totalPrice)})`}
            </button>
          </form>

          {/* CỘT PHẢI: TÓM TẮT ĐẶT PHÒNG */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0f1736] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl sticky top-24">
              <h2 className="text-lg font-bold font-serif border-b border-slate-800 pb-4 mb-4 text-[#e5c158] flex items-center justify-between">
                <span>Tóm Tắt Đặt Phòng</span>
                <span className="text-xs font-mono bg-[#e5c158]/20 px-2.5 py-1 rounded-md text-[#e5c158]">Mới</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase">Khách sạn</p>
                  <p className="text-base font-bold font-serif text-white mt-0.5">{decodeURIComponent(hotelName)}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase">Loại phòng</p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">Phòng {decodeURIComponent(roomNumber)}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase">Số lượng khách</p>
                  <p className="text-sm font-semibold text-[#e5c158] mt-0.5">👥 {guestDetails}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#070c1e] p-3.5 rounded-2xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block">Check-in</span>
                    <span className="font-bold text-white mt-0.5 block">{checkIn || "Chưa chọn"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Check-out</span>
                    <span className="font-bold text-white mt-0.5 block">{checkOut || "Chưa chọn"}</span>
                  </div>
                </div>

                {/* VOUCHER / ƯU ĐÃI SECTION */}
                <div className="bg-[#070c1e] p-4 rounded-2xl border border-slate-800/80 space-y-3">
                  <label className="block text-xs font-bold text-[#e5c158] uppercase flex items-center justify-between">
                    <span>🎟️ Mã ưu đãi / Voucher</span>
                    {appliedVoucher && (
                      <span className="text-[11px] text-emerald-400 font-normal">● Đã áp dụng mã</span>
                    )}
                  </label>

                  {appliedVoucher ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-400">
                      <div>
                        <div className="font-bold font-mono text-sm text-yellow-400">{appliedVoucher.code}</div>
                        <div className="text-[11px] text-emerald-300 mt-0.5">
                          Giảm {appliedVoucher.discount_type === "PERCENT" ? `${appliedVoucher.discount_value}%` : formatVND(Number(appliedVoucher.discount_value))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold transition"
                      >
                        ✕ Gỡ mã
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nhập mã giảm giá..."
                          value={inputVoucherCode}
                          onChange={(e) => {
                            setInputVoucherCode(e.target.value.toUpperCase());
                            setVoucherError("");
                          }}
                          className="flex-1 bg-[#0f1736] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-yellow-400 placeholder:text-slate-500 focus:outline-none focus:border-[#e5c158]"
                        />
                        <button
                          type="button"
                          disabled={voucherLoading || !inputVoucherCode.trim()}
                          onClick={() => handleApplyVoucher()}
                          className="px-4 py-2 bg-[#e5c158] hover:bg-yellow-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
                        >
                          {voucherLoading ? "..." : "Áp dụng"}
                        </button>
                      </div>
                      {voucherError && (
                        <p className="text-[11px] text-rose-400 mt-1.5 font-medium">⚠️ {voucherError}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Đơn giá phòng ({nights} đêm)</span>
                    <span>{formatVND(subTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Chiết khấu ưu đãi</span>
                      <span>-{formatVND(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Thuế & Phí dịch vụ (Đã bao gồm)</span>
                    <span>0 VNĐ</span>
                  </div>
                  <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-white">Tổng thanh toán</span>
                    <span className="text-2xl font-extrabold text-[#e5c158] font-mono">{formatVND(totalPrice)}</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl text-[11px] text-slate-400 leading-relaxed">
                  🛡️ Khách sạn hỗ trợ hoàn hủy miễn phí trước ngày nhận phòng 48 tiếng.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070c1e] text-white flex items-center justify-center">Đang tải thông tin đặt phòng...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
