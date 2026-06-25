"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function BookingHistoryPage() {
  const authUser = useSelector((state: any) => state.auth?.user);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập lấy danh sách đặt phòng cá nhân khớp với cấu trúc JSON ở Danh sách API thiếu
    setTimeout(() => {
      setBookings([
        {
          booking_id: 101,
          hotel_name: "Sofitel Legend Metropole Hà Nội",
          hotel_image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
          room_number: "302",
          room_type_name: "Deluxe Suite",
          check_in: "2026-07-10T14:00:00.000Z",
          check_out: "2026-07-12T12:00:00.000Z",
          guest_count: 2,
          total_price: 5880000,
          status: 1,
          status_text: "Đã xác nhận",
          created_at: "2026-06-25T08:00:00.000Z"
        },
        {
          booking_id: 102,
          hotel_name: "Premier Village Phú Quốc Resort",
          hotel_image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500",
          room_number: "105",
          room_type_name: "Ocean Villa",
          check_in: "2026-08-15T14:00:00.000Z",
          check_out: "2026-08-18T12:00:00.000Z",
          guest_count: 4,
          total_price: 15525000,
          status: 0,
          status_text: "Chờ thanh toán",
          created_at: "2026-06-20T10:30:00.000Z"
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const formatVND = (num: number) => num.toLocaleString("vi-VN") + " VNĐ";
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("vi-VN");

  return (
    <div className="min-h-screen bg-[#070c1e] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#e5c158]">🏨 Lịch Sử Đặt Phòng</h1>
            <p className="text-sm text-slate-400 mt-1">Danh sách các phòng bạn đã đặt tại hệ thống TravelBooking</p>
          </div>
          <Link href="/" className="bg-[#0f1736] hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 transition">
            ← Tiếp tục đặt phòng
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Đang tải danh sách đặt phòng...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-[#0f1736] rounded-3xl border border-dashed border-slate-800">
            <span className="text-4xl block mb-3">📭</span>
            <p className="text-slate-400">Bạn chưa có lịch sử đặt phòng nào.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div key={b.booking_id} className="bg-[#0f1736] border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row gap-6 items-center hover:border-[#e5c158]/30 transition">
                <img src={b.hotel_image} alt={b.hotel_name} className="w-full md:w-48 h-36 object-cover rounded-2xl bg-slate-900 flex-shrink-0" />
                
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-mono bg-[#e5c158]/15 text-[#e5c158] px-2.5 py-0.5 rounded">Mã vé #{b.booking_id}</span>
                      <h3 className="text-xl font-serif font-bold text-white mt-1.5">{b.hotel_name}</h3>
                      <p className="text-xs text-slate-400">Phòng {b.room_number} ({b.room_type_name}) — {b.guest_count} khách</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${b.status === 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                      {b.status_text}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Nhận phòng</span>
                      <strong>{formatDate(b.check_in)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Trả phòng</span>
                      <strong>{formatDate(b.check_out)}</strong>
                    </div>
                    <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <span className="text-slate-500 block">Tổng thanh toán</span>
                      <strong className="text-[#e5c158] text-sm font-mono">{formatVND(b.total_price)}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
                  <Link href={`/hotels/1`} className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl transition">
                    Xem khách sạn
                  </Link>
                  <button onClick={() => alert("Đã gửi yêu cầu hỗ trợ vé #" + b.booking_id)} className="flex-1 text-center bg-[#070c1e] hover:bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold py-2.5 px-4 rounded-xl transition">
                    Hủy vé
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
