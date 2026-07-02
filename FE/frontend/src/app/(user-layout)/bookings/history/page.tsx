"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { getUserBookingsAPI } from "../../../../services/api";
import { motion, AnimatePresence } from "framer-motion";

// Mapping trạng thái booking sang text + màu hiển thị
const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  0: { label: "⏳ Chờ xác nhận",   cls: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  1: { label: "✅ Đã thanh toán",  cls: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
  2: { label: "🏁 Hoàn thành",     cls: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  3: { label: "❌ Đã hủy",          cls: "bg-red-500/20 text-red-400 border border-red-500/30" },
};

const formatVND  = (num: number) => num.toLocaleString("vi-VN") + " VNĐ";
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("vi-VN");
const calcNights = (ci: string, co: string) =>
  Math.max(1, Math.ceil((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80";

export default function BookingHistoryPage() {
  const authUser = useSelector((state: any) => state.auth?.user);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilterStatus] = useState<number | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        // Gọi API thật: GET /api/users/getUserBookings/:userId
        const userId = authUser?.user_id || authUser?.id;
        if (!userId) {
          setBookings([]);
          setLoading(false);
          return;
        }
        // Lấy tất cả bookings của user (limit 50 để đủ hiển thị)
        const data = await getUserBookingsAPI(userId, 1, 50);
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi tải lịch sử đặt phòng:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [authUser]);

  // Lọc theo trạng thái nếu có
  const filtered = filterStatus === null
    ? bookings
    : bookings.filter((b: any) => Number(b.status) === filterStatus);

  return (
    <div className="min-h-screen bg-[#070c1e] text-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-5 border-b border-slate-800"
        >
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#e5c158]">🏨 Lịch Sử Đặt Phòng</h1>
            <p className="text-sm text-slate-400 mt-1">
              Xin chào <strong className="text-white">{authUser?.full_name || authUser?.fullName || "Quý khách"}</strong>!
              {" "}Tổng <span className="text-[#e5c158] font-bold">{bookings.length}</span> lần đặt phòng.
            </p>
          </div>
          <Link
            href="/hotel"
            className="mt-4 sm:mt-0 bg-gradient-to-r from-[#e5c158] to-[#d4af37] text-black px-5 py-2.5 rounded-xl text-xs font-extrabold shadow transition hover:brightness-110"
          >
            + Đặt phòng mới
          </Link>
        </motion.div>

        {/* Bộ lọc trạng thái */}
        {!loading && bookings.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilterStatus(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${filterStatus === null ? "bg-[#e5c158] text-black" : "bg-[#0f1736] text-slate-300 border border-slate-700 hover:border-slate-600"}`}
            >
              Tất cả ({bookings.length})
            </button>
            {Object.entries(STATUS_MAP).map(([k, v]) => {
              const cnt = bookings.filter((b: any) => Number(b.status) === Number(k)).length;
              if (cnt === 0) return null;
              return (
                <button
                  key={k}
                  onClick={() => setFilterStatus(Number(k))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${filterStatus === Number(k) ? "bg-[#e5c158] text-black" : "bg-[#0f1736] text-slate-300 border border-slate-700 hover:border-slate-600"}`}
                >
                  {v.label} ({cnt})
                </button>
              );
            })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#0f1736] border border-slate-800 rounded-3xl p-6 flex gap-6 animate-pulse">
                <div className="w-40 h-32 rounded-2xl bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-3 pt-2">
                  <div className="h-4 bg-slate-800 rounded w-32" />
                  <div className="h-6 bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                  <div className="h-5 bg-slate-800 rounded w-28 mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chưa đăng nhập */}
        {!loading && !authUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-[#0f1736] rounded-3xl border border-dashed border-slate-700"
          >
            <span className="text-5xl block mb-4">🔒</span>
            <p className="text-lg font-bold text-white mb-2">Vui lòng đăng nhập</p>
            <p className="text-sm text-slate-400 mb-6">Bạn cần đăng nhập để xem lịch sử đặt phòng của mình.</p>
            <Link href="/login" className="bg-gradient-to-r from-[#e5c158] to-[#d4af37] text-black font-extrabold px-6 py-3 rounded-xl text-sm transition hover:brightness-110">
              Đăng nhập ngay
            </Link>
          </motion.div>
        )}

        {/* Chưa có lịch sử */}
        {!loading && authUser && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-[#0f1736] rounded-3xl border border-dashed border-slate-800"
          >
            <span className="text-5xl block mb-4">📭</span>
            <p className="text-lg font-bold text-white mb-2">
              {filterStatus !== null ? "Không có đặt phòng nào với trạng thái này" : "Bạn chưa có lịch sử đặt phòng nào."}
            </p>
            {filterStatus !== null && (
              <button onClick={() => setFilterStatus(null)} className="mt-3 text-xs text-[#e5c158] border border-[#e5c158]/30 px-4 py-2 rounded-xl hover:bg-[#e5c158]/10 transition">
                Xem tất cả
              </button>
            )}
          </motion.div>
        )}

        {/* Danh sách booking */}
        {!loading && filtered.length > 0 && (
          <motion.div
            className="space-y-5"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <AnimatePresence>
              {filtered.map((b: any) => {
                // Lấy thông tin phòng + khách sạn từ nested data trả về BE
                const room      = b.rooms;
                const hotel     = room?.hotels;
                const roomType  = room?.room_types;
                const roomImgs  = room?.room_images;
                const hotelImgUrl = roomImgs?.[0]?.image_url ?? PLACEHOLDER_IMG;
                const hotelName   = hotel?.hotel_name ?? "Khách sạn";
                const hotelId     = hotel?.hotel_id;
                const roomNum     = room?.room_number ?? b.room_id;
                const typeName    = roomType?.type_name ?? "Phòng";
                const nights      = calcNights(b.check_in, b.check_out);
                const statusInfo  = STATUS_MAP[Number(b.status)] ?? STATUS_MAP[0];

                return (
                  <motion.div
                    key={b.booking_id}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className="bg-[#0f1736] border border-slate-800/80 rounded-3xl overflow-hidden
                               hover:border-[#e5c158]/30 hover:shadow-[0_8px_32px_rgba(229,193,88,0.06)]
                               transition-all duration-300 flex flex-col md:flex-row"
                  >
                    {/* Ảnh phòng */}
                    <div className="w-full md:w-52 h-48 md:h-auto flex-shrink-0 relative overflow-hidden">
                      <img
                        src={hotelImgUrl}
                        alt={hotelName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Nội dung */}
                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className="text-[11px] font-mono bg-[#e5c158]/15 text-[#e5c158] px-2.5 py-0.5 rounded">
                              #{b.booking_id}
                            </span>
                            <h3 className="text-lg md:text-xl font-serif font-bold text-white mt-1.5">
                              {hotelName}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              📍 {hotel?.city || hotel?.address || "Việt Nam"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="bg-slate-800/80 text-slate-300 text-[10px] px-3 py-1.5 rounded-lg border border-slate-700/60">
                            🛏️ Phòng {roomNum}
                          </span>
                          <span className="bg-slate-800/80 text-slate-300 text-[10px] px-3 py-1.5 rounded-lg border border-slate-700/60">
                            🏷️ {typeName}
                          </span>
                          <span className="bg-slate-800/80 text-slate-300 text-[10px] px-3 py-1.5 rounded-lg border border-slate-700/60">
                            👥 {b.guest_count} khách
                          </span>
                          <span className="bg-slate-800/80 text-slate-300 text-[10px] px-3 py-1.5 rounded-lg border border-slate-700/60">
                            🌙 {nights} đêm
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs bg-black/20 rounded-2xl p-3 border border-slate-800/60">
                          <div>
                            <span className="text-slate-500 block mb-0.5">Nhận phòng</span>
                            <strong className="text-white">{formatDate(b.check_in)}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-0.5">Trả phòng</span>
                            <strong className="text-white">{formatDate(b.check_out)}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-0.5">Tổng tiền</span>
                            <strong className="text-[#e5c158] text-sm font-mono">
                              {formatVND(Number(b.total_price))}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {hotelId && (
                          <Link
                            href={`/hotels/${hotelId}`}
                            className="bg-[#0d1430] hover:bg-slate-800 text-slate-200 text-xs font-bold py-2 px-4 rounded-xl border border-slate-700 transition"
                          >
                            Xem khách sạn
                          </Link>
                        )}
                        {Number(b.status) === 0 && (
                          <button
                            onClick={() => alert("Chức năng hủy vé sẽ được cập nhật sớm!")}
                            className="bg-[#0d1430] hover:bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold py-2 px-4 rounded-xl transition"
                          >
                            Hủy đặt phòng
                          </button>
                        )}
                        <span className="text-[10px] text-slate-600 self-center ml-auto">
                          Đặt lúc: {formatDate(b.created_at)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </div>
  );
}
