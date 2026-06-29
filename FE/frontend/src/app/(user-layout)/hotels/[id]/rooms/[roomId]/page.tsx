"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getRoomsByHotelAPI, getHotelByIdAPI } from "../../../../../../services/api";
import { motion, AnimatePresence } from "framer-motion";

// ── Hằng số fallback đặt ngoài component để tránh tạo lại mỗi render ──────────
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80",
  "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&q=80",
];

const FALLBACK_AMENITIES = [
  "Wi-Fi tốc độ cao 5G",
  "Bữa sáng Buffet miễn phí",
  "Bồn tắm Jacuzzi massage",
  "Smart TV 65 inch OLED",
  "Minibar đồ uống cao cấp",
  "Máy pha cà phê Nespresso",
  "Dịch vụ phòng 24/7",
  "Két sắt an toàn sinh trắc học",
];

const FALLBACK_DESCRIPTION =
  "Phòng nghỉ dưỡng cao cấp với ban công riêng hướng biển toàn cảnh, nội thất gỗ óc chó sang trọng, được trang bị giường King-size mềm mại và phòng tắm lát đá cẩm thạch Ý với bồn tắm nằm spa thư giãn.";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatVND = (num: number) => (num || 0).toLocaleString("vi-VN") + " VNĐ";

const calcNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 1;
  const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / MS_PER_DAY);
  return days > 0 ? days : 1;
};

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params?.id ? Number(params.id) : 1;
  const roomId = params?.roomId ? Number(params.roomId) : 1;

  const [room, setRoom] = useState<any>(null);
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + MS_PER_DAY).toISOString().split("T")[0];
    setCheckIn(today);
    setCheckOut(tomorrow);

    const fetchData = async () => {
      setLoading(true);
      try {
        const [roomsRes, hotelRes]: any[] = await Promise.all([
          getRoomsByHotelAPI(hotelId),
          getHotelByIdAPI(hotelId),
        ]);

        setHotel(hotelRes?.data || hotelRes || null);

        const roomsList = Array.isArray((roomsRes as any)?.data)
          ? (roomsRes as any).data
          : Array.isArray(roomsRes)
          ? roomsRes
          : [];

        const found = roomsList.find((r: any) => r.room_id === roomId);
        if (found) {
          // Gán fallback cho các trường thiếu để không làm hỏng UI
          if (!found.room_images?.length) found.room_images = FALLBACK_IMAGES.map(url => ({ image_url: url }));
          if (!found.room_types?.description) found.room_types = { ...found.room_types, description: FALLBACK_DESCRIPTION };
          if (!found.room_types?.room_type_amenities?.length) {
            found.room_types.room_type_amenities = FALLBACK_AMENITIES.map(name => ({ amenities: { amenity_name: name } }));
          }
          setRoom(found);
        } else {
          // Phòng không tồn tại trong DB — dùng skeleton data
          setRoom({
            room_id: roomId,
            room_number: "305",
            price_per_night: 2850000,
            status: 0,
            room_types: {
              type_name: "Deluxe Ocean View Suite",
              description: FALLBACK_DESCRIPTION,
              max_guest: 4,
              room_type_amenities: FALLBACK_AMENITIES.map(name => ({ amenities: { amenity_name: name } })),
            },
            room_images: FALLBACK_IMAGES.map(url => ({ image_url: url })),
          });
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu phòng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hotelId, roomId]);

  // useMemo để tránh tính toán lại mỗi render
  const images = useMemo(
    () => room?.room_images?.map((img: any) => img.image_url) ?? FALLBACK_IMAGES,
    [room]
  );

  const amenities = useMemo(
    () =>
      room?.room_types?.room_type_amenities?.map((i: any) => i.amenities?.amenity_name).filter(Boolean) ??
      FALLBACK_AMENITIES,
    [room]
  );

  const nights = useMemo(() => calcNights(checkIn, checkOut), [checkIn, checkOut]);
  const totalPrice = useMemo(() => (room?.price_per_night || 2850000) * nights, [room, nights]);

  const handleBookNow = () => {
    sessionStorage.setItem(
      "booking_draft",
      JSON.stringify({
        hotel_id: hotelId,
        hotel_name: hotel?.hotel_name || "TravelBooking Hotel",
        room_id: roomId,
        room_number: room?.room_number || "305",
        room_type_name: room?.room_types?.type_name || "Deluxe Suite",
        price_per_night: room?.price_per_night || 2850000,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guests,
        total_price: totalPrice,
      })
    );
    // Sau khi lưu draft, điều hướng về trang khách sạn để tiến hành checkout
    router.push(`/hotel/${hotelId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070c1e] text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#e5c158]/30 border-t-[#e5c158] rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#e5c158] tracking-widest animate-pulse">
          ĐANG TẢI THÔNG TIN PHÒNG...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070c1e] text-white pb-20 font-sans">

      {/* TECH LEAD NOTE — nhắc nhở cần API getRoomById */}
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/30 to-amber-600/20 border-b border-amber-500/40 py-2.5 px-4 text-center text-xs text-amber-300">
        <span className="font-bold uppercase tracking-wider bg-amber-500 text-black px-2 py-0.5 rounded mr-2">
          TECH LEAD NOTE
        </span>
        Frontend đang kết hợp{" "}
        <code className="text-white font-mono bg-black/40 px-1.5 py-0.5 rounded">getRoomByHotel</code> +
        fallback data. Backend cần bổ sung:{" "}
        <strong className="text-white font-mono">GET /api/rooms/getRoomById/:roomId</strong>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
          <Link href="/" className="hover:text-[#e5c158] transition">Trang chủ</Link>
          <span>/</span>
          <Link href={`/hotel/${hotelId}`} className="hover:text-[#e5c158] transition">
            {hotel?.hotel_name || "Khách sạn"}
          </Link>
          <span>/</span>
          <span className="text-[#e5c158] font-bold">
            Phòng {room?.room_number} ({room?.room_types?.type_name})
          </span>
        </nav>

        {/* HEADER TITLE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#e5c158]/20 text-[#e5c158] border border-[#e5c158]/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                👑 Premium Signature Room
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
                ● Sẵn sàng đón khách
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-wide">
              {room?.room_types?.type_name || "Deluxe Suite"} — Phòng {room?.room_number}
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              📍 {hotel?.hotel_name} • 🌆 {hotel?.city || "Khu nghỉ dưỡng đắc địa"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => alert("Đã sao chép đường dẫn phòng!")}
              className="bg-[#0f1736] hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-2 transition"
            >
              🔗 Chia sẻ
            </button>
            <button
              onClick={() => alert("Đã thêm vào danh sách yêu thích!")}
              className="bg-[#0f1736] hover:bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition"
            >
              ❤️ Yêu thích
            </button>
          </div>
        </div>

        {/* GALLERY — 1 ảnh lớn + grid 4 ảnh nhỏ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          {/* Ảnh chính */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="lg:col-span-2 h-80 sm:h-[420px] rounded-3xl overflow-hidden relative group cursor-pointer border border-slate-800 bg-slate-900 shadow-2xl"
          >
            <img
              src={images[activeImageIndex]}
              alt="Main Room View"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition" />
            <div className="absolute bottom-5 right-5 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
              🔍 Bấm phóng to ({activeImageIndex + 1}/{images.length})
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 h-auto lg:h-[420px]">
            {images.slice(0, 4).map((imgUrl: string, idx: number) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 bg-slate-900 ${
                  activeImageIndex === idx
                    ? "border-[#e5c158] scale-[0.98] shadow-[0_0_20px_rgba(229,193,88,0.3)]"
                    : "border-slate-800/80 hover:border-slate-600 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={imgUrl} alt={`Ảnh phòng ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* DETAILS + BOOKING CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          {/* Cột trái (2/3) */}
          <div className="lg:col-span-2 space-y-10">

            {/* Thông số nhanh */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#0f1736]/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
              {[
                { icon: "📐", label: "Diện tích", value: "65 m²" },
                { icon: "👥", label: "Sức chứa", value: `Tối đa ${room?.room_types?.max_guest || 4} người` },
                { icon: "🛏️", label: "Loại giường", value: "1 Giường King" },
                { icon: "🛁", label: "Phòng tắm", value: "Bồn tắm & Vòi sen" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="text-center p-3 rounded-2xl bg-black/20 border border-slate-800/50">
                  <span className="text-2xl block mb-1">{icon}</span>
                  <span className="text-xs text-slate-400 block">{label}</span>
                  <strong className="text-white text-sm">{value}</strong>
                </div>
              ))}
            </div>

            {/* Mô tả */}
            <div className="bg-[#0f1736] border border-slate-800 rounded-3xl p-8 shadow-xl space-y-4">
              <h3 className="text-xl font-serif font-bold text-[#e5c158] flex items-center gap-2">
                ✨ Giới Thiệu & Trải Nghiệm
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {room?.room_types?.description || FALLBACK_DESCRIPTION}
              </p>
              <div className="border-t border-slate-800/80 pt-4 flex flex-wrap gap-3 text-xs text-emerald-400 font-semibold">
                {["Không gian yên tĩnh tuyệt đối", "Hỗ trợ check-in sớm miễn phí (tùy tình trạng)", "Dọn phòng 2 lần/ngày"].map((item) => (
                  <span key={item} className="bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    ✔️ {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Tiện nghi */}
            <div className="bg-[#0f1736] border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
              <h3 className="text-xl font-serif font-bold text-[#e5c158] flex items-center gap-2">
                💎 Tiện Nghi Đặc Quyền
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {amenities.map((item: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-[#e5c158]/10 to-transparent border border-[#e5c158]/20 text-slate-200 text-xs font-semibold hover:border-[#e5c158]/50 transition shadow-sm"
                  >
                    <span className="text-lg">⚡</span>
                    <span className="leading-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chính sách hủy */}
            <div className="bg-gradient-to-br from-[#162044] to-[#0f1736] border border-blue-500/30 rounded-3xl p-8 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-xl font-serif font-bold text-blue-300 flex items-center gap-2">
                🛡️ Chính Sách Đặt & Hủy Phòng
              </h3>
              <ul className="space-y-3 text-xs md:text-sm text-slate-300 list-disc pl-5">
                <li><strong className="text-white">Hủy miễn phí:</strong> Hoàn tiền 100% nếu hủy trước ngày nhận phòng ít nhất 48 giờ.</li>
                <li><strong className="text-white">Hủy muộn:</strong> Tính phí đêm đầu tiên nếu hủy trong vòng 48 giờ trước giờ check-in.</li>
                <li><strong className="text-white">Giờ nhận phòng:</strong> Từ 14:00 chiều • <strong className="text-white">Giờ trả phòng:</strong> Trước 12:00 trưa.</li>
                <li><strong className="text-white">Quy định khác:</strong> Không hút thuốc trong phòng, không mang theo thú cưng.</li>
              </ul>
            </div>

          </div>

          {/* Cột phải (1/3) — Sticky booking card */}
          <div className="lg:sticky lg:top-8 bg-[#0f1736] border border-[#e5c158]/40 rounded-3xl p-6 sm:p-8 shadow-[0_10px_50px_rgba(0,0,0,0.5)] space-y-6">
            <div className="flex items-baseline justify-between border-b border-slate-800 pb-5">
              <div>
                <span className="text-3xl font-mono font-extrabold text-[#e5c158]">
                  {formatVND(room?.price_per_night || 2850000)}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">Giá đã bao gồm thuế & phí dịch vụ</span>
              </div>
              <span className="text-xs bg-[#e5c158]/20 text-[#e5c158] font-bold px-2.5 py-1 rounded-lg">
                ⚡ Giá tốt nhất
              </span>
            </div>

            {/* Chọn ngày */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Nhận phòng", value: checkIn, onChange: setCheckIn },
                  { label: "Trả phòng", value: checkOut, onChange: setCheckOut },
                ].map(({ label, value, onChange }) => (
                  <div key={label}>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">{label}</label>
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className="w-full bg-[#070c1e] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#e5c158]"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Số lượng khách</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-[#070c1e] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#e5c158]"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>👥 {n} Khách người lớn</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bảng giá */}
            <div className="bg-black/30 p-4 rounded-2xl border border-slate-800/80 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>{formatVND(room?.price_per_night || 2850000)} × {nights} đêm</span>
                <span>{formatVND(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Phí dịch vụ & VAT</span>
                <span className="text-emerald-400 font-bold">Miễn phí</span>
              </div>
              <div className="border-t border-slate-800 pt-2.5 flex justify-between items-center text-sm font-bold">
                <span className="text-white">TỔNG THANH TOÁN:</span>
                <span className="text-lg text-[#e5c158] font-mono">{formatVND(totalPrice)}</span>
              </div>
            </div>

            <button
              onClick={handleBookNow}
              className="w-full bg-gradient-to-r from-[#e5c158] via-[#f3d37a] to-[#d4af37] hover:brightness-110 text-black font-extrabold py-4 rounded-2xl transition-all shadow-xl shadow-yellow-500/20 text-sm tracking-wider uppercase active:scale-95 flex items-center justify-center gap-2"
            >
              ⚡ Đặt Phòng Ngay
            </button>

            <p className="text-[11px] text-center text-slate-400">
              🔒 Đảm bảo hoàn tiền • Không thu phí đặt chỗ hôm nay
            </p>
          </div>

        </div>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 select-none"
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl font-bold flex items-center justify-center transition"
            >
              ✕
            </button>

            <button
              onClick={() => setActiveImageIndex((p) => (p === 0 ? images.length - 1 : p - 1))}
              className="absolute left-4 md:left-10 w-14 h-14 rounded-full bg-black/60 hover:bg-[#e5c158] text-white hover:text-black text-2xl font-bold flex items-center justify-center border border-white/20 transition shadow-2xl"
            >
              ←
            </button>

            <div className="max-w-5xl max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10">
              <img
                src={images[activeImageIndex]}
                alt={`Ảnh phòng ${activeImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
            </div>

            <button
              onClick={() => setActiveImageIndex((p) => (p === images.length - 1 ? 0 : p + 1))}
              className="absolute right-4 md:right-10 w-14 h-14 rounded-full bg-black/60 hover:bg-[#e5c158] text-white hover:text-black text-2xl font-bold flex items-center justify-center border border-white/20 transition shadow-2xl"
            >
              →
            </button>

            <div className="absolute bottom-6 text-center text-sm font-semibold text-slate-300 bg-black/60 px-6 py-2.5 rounded-full border border-white/10">
              Ảnh {activeImageIndex + 1} / {images.length} • Phòng {room?.room_number} ({room?.room_types?.type_name})
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
