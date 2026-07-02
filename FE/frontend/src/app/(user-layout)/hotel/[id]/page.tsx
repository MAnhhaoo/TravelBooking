"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getHotelByIdAPI, getRoomsByHotelAPI, getReviewsByHotelAPI } from "../../../../services/api";
import { formatCurrencyVND } from "../../../../utils/dataMappers";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import Link from "next/link";

// ──────────────────────────────────────────────────────────
// Gallery Slideshow Component
// ──────────────────────────────────────────────────────────
function ImageGallery({ images }: { images: { image_url: string }[] }) {
  const [current, setCurrent] = useState(0);

  const FALLBACKS = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    "https://images.unsplash.com/photo-1542314831-c6a4d27ce6a2?w=1200&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80",
  ];

  const slides =
    images && images.length > 0
      ? images.map((i) => i.image_url)
      : FALLBACKS;

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    [slides.length]
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    [slides.length]
  );

  return (
    <div className="mb-12">
      {/* Main image */}
      <div className="relative w-full h-[420px] md:h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800/50 group">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={slides[current]}
            alt={`Ảnh ${current + 1}`}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Counter badge */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
          {current + 1} / {slides.length}
        </div>

        {/* Navigation buttons */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2
                         w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm
                         text-white flex items-center justify-center
                         opacity-0 group-hover:opacity-100 transition-all duration-300
                         hover:bg-black/70 hover:scale-110 active:scale-95"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm
                         text-white flex items-center justify-center
                         opacity-0 group-hover:opacity-100 transition-all duration-300
                         hover:bg-black/70 hover:scale-110 active:scale-95"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {slides.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {slides.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200
                          ${idx === current
                  ? "border-[#e5c158] scale-105 shadow-[0_0_14px_rgba(229,193,88,0.3)]"
                  : "border-slate-700/50 opacity-60 hover:opacity-90 hover:border-slate-500"
                }`}
            >
              <img src={src} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Pagination Component
// ──────────────────────────────────────────────────────────
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-semibold
                   disabled:opacity-30 hover:bg-slate-700 transition"
      >
        ‹ Trước
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-bold transition
                      ${p === currentPage
              ? "bg-[#e5c158] text-black shadow-[0_0_12px_rgba(229,193,88,0.3)]"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-semibold
                   disabled:opacity-30 hover:bg-slate-700 transition"
      >
        Sau ›
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Star rating helper
// ──────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`text-sm ${s <= rating ? "text-[#e5c158]" : "text-slate-700"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────
export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const authUser = useSelector((state: any) => state.auth?.user);

  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Rooms pagination
  const [roomPage, setRoomPage] = useState(1);
  const [roomPagination, setRoomPagination] = useState<any>(null);

  // Reviews pagination
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPagination, setReviewPagination] = useState<any>(null);

  // Fetch hotel info
  useEffect(() => {
    if (!id) return;
    const fetchHotel = async () => {
      setLoading(true);
      try {
        const hotelData = await getHotelByIdAPI(id);
        setHotel(hotelData);
      } catch (error) {
        console.error("Lỗi fetch chi tiết khách sạn:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  // Fetch rooms with pagination
  useEffect(() => {
    if (!id) return;
    const fetchRooms = async () => {
      try {
        const res: any = await getRoomsByHotelAPI(id, roomPage, 10);
        const arr = Array.isArray(res) ? res : (res?.data || []);
        setRooms(arr);
        if (res?.pagination) setRoomPagination(res.pagination);
      } catch (err) {
        console.error("Lỗi fetch phòng:", err);
      }
    };
    fetchRooms();
  }, [id, roomPage]);

  // Fetch reviews with pagination
  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      try {
        const res: any = await getReviewsByHotelAPI(id, reviewPage, 10);
        const arr = Array.isArray(res) ? res : (res?.data || []);
        setReviews(arr);
        if (res?.pagination) setReviewPagination(res.pagination);
      } catch (err) {
        console.error("Lỗi fetch reviews:", err);
      }
    };
    fetchReviews();
  }, [id, reviewPage]);

  const handleOpenBooking = (room: any) => {
    if (!authUser) {
      alert("Vui lòng đăng nhập để đặt phòng!");
      router.push("/login");
      return;
    }
    router.push(
      `/bookings/checkout?hotelId=${id}&roomId=${room.room_id}&price=${room.price_per_night}&hotelName=${encodeURIComponent(hotel?.hotel_name || "Khách sạn")}&roomNumber=${room.room_number || "Tiêu chuẩn"}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070c1e] flex items-center justify-center text-[#e5c158]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#e5c158] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-slate-400 animate-pulse">Đang tải dữ liệu khách sạn...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#070c1e] text-white p-20 text-center text-2xl">
        Không tìm thấy khách sạn!
      </div>
    );
  }

  // Tính rating trung bình
  const avgRatingNum =
    reviews.length > 0
      ? reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length
      : 0;
  const avgRating = avgRatingNum > 0 ? avgRatingNum.toFixed(1) : null;

  return (
    <div className="bg-[#070c1e] min-h-screen text-white font-sans pb-24">
      <div className="max-w-7xl mx-auto px-4 pt-10">

        {/* ── Breadcrumb ── */}
        <div className="flex gap-2 text-xs text-[#e5c158] font-bold tracking-widest uppercase mb-5">
          <Link href="/" className="hover:underline">Trang chủ</Link>
          <span className="text-slate-600">›</span>
          <Link href="/hotels" className="hover:underline">Khách sạn</Link>
          <span className="text-slate-600">›</span>
          <span className="text-slate-400 font-normal normal-case">{hotel.hotel_name}</span>
        </div>

        {/* ── Tiêu đề & Meta ── */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-light text-white leading-tight mb-4">
            {hotel.hotel_name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            {avgRating && (
              <span className="flex items-center gap-1.5 text-[#e5c158] font-bold bg-[#e5c158]/10 px-3 py-1 rounded-full">
                ⭐ {avgRating}
                <span className="text-slate-400 font-normal">
                  ({reviewPagination?.totalItems || reviews.length} đánh giá)
                </span>
              </span>
            )}
            <span className="flex items-center gap-1">📍 {hotel.address}, {hotel.city}</span>
            {hotel.phone && <span className="flex items-center gap-1">📞 {hotel.phone}</span>}
            {hotel.star_rating && (
              <span className="flex items-center gap-1 text-[#e5c158]">
                {"★".repeat(hotel.star_rating)} {hotel.star_rating} sao
              </span>
            )}
          </div>
        </div>

        {/* ── Gallery ── */}
        <ImageGallery images={hotel.hotel_images || []} />

        {/* ── Mô tả ── */}
        <section className="bg-[#0f1736] p-8 rounded-3xl border border-slate-800/50 mb-12">
          <h2 className="text-2xl font-serif mb-4 text-[#e5c158]">Mô tả khách sạn</h2>
          <p className="text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            {hotel.description || "Khách sạn cao cấp mang đến trải nghiệm nghỉ dưỡng tuyệt vời cho bạn và gia đình."}
          </p>
        </section>

        {/* ── Danh sách phòng ── */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-white border-b border-slate-800 pb-3 flex-1 mr-8">
              Danh sách phòng{" "}
              {roomPagination && (
                <span className="text-sm text-slate-400 font-normal">
                  ({roomPagination.totalItems} phòng)
                </span>
              )}
            </h2>
          </div>

          {rooms.length === 0 ? (
            <div className="bg-[#0f1736] border border-dashed border-slate-700 rounded-2xl p-12 text-center">
              <p className="text-slate-400">Hiện chưa có phòng nào khả dụng tại khách sạn này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room: any) => {
                const amenities: any[] =
                  room.room_types?.room_type_amenities?.map((rta: any) => rta.amenities) || [];
                const roomImages: string[] =
                  room.room_images?.map((ri: any) => ri.image_url) || [];

                return (
                  <motion.div
                    key={room.room_id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#0f1736] rounded-2xl border border-slate-800/50 overflow-hidden
                               hover:border-[#e5c158]/20 hover:shadow-[0_8px_32px_rgba(229,193,88,0.07)]
                               transition-all duration-400 group"
                  >
                    {/* Ảnh phòng */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={
                          roomImages[0] ||
                          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"
                        }
                        alt={room.room_number}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {/* Status badge */}
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${room.status === 0
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                      >
                        {room.status === 0 ? "Còn phòng" : "Hết phòng"}
                      </span>
                    </div>

                    {/* Nội dung card phòng */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-white text-base group-hover:text-[#e5c158] transition-colors">
                            Phòng {room.room_number}
                          </h3>
                          {room.room_types?.type_name && (
                            <span className="text-[11px] text-[#e5c158] font-semibold bg-[#e5c158]/10 px-2 py-0.5 rounded-full">
                              {room.room_types.type_name}
                            </span>
                          )}
                        </div>
                        {room.room_types?.max_guest && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            👥 {room.room_types.max_guest} khách
                          </span>
                        )}
                      </div>

                      {/* Mô tả loại phòng */}
                      {room.room_types?.description && (
                        <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                          {room.room_types.description}
                        </p>
                      )}

                      {/* Tiện ích */}
                      {amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {amenities.slice(0, 5).map((am: any, i: number) => (
                            <span
                              key={i}
                              className="text-[10px] text-slate-300 bg-slate-800/80 border border-slate-700/50 px-2 py-0.5 rounded-full"
                            >
                              {am.name || am.amenity_name}
                            </span>
                          ))}
                          {amenities.length > 5 && (
                            <span className="text-[10px] text-slate-500 px-2 py-0.5">
                              +{amenities.length - 5} khác
                            </span>
                          )}
                        </div>
                      )}

                      {/* Giá + Nút */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                        <div>
                          <p className="text-[10px] text-slate-500 line-through">
                            {formatCurrencyVND(Number(room.price_per_night) * 1.2)}
                          </p>
                          <p className="text-[#e5c158] font-extrabold text-lg leading-none">
                            {formatCurrencyVND(room.price_per_night)}
                            <span className="text-[10px] text-slate-500 font-normal ml-1">/đêm</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/hotels/${id}/rooms/${room.room_id}`}>
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-2 text-xs font-bold rounded-xl
                                         bg-slate-800/80 border border-slate-700/60
                                         text-slate-300 hover:text-white hover:border-slate-600
                                         transition-all duration-200"
                            >
                              Chi tiết
                            </motion.button>
                          </Link>
                          <motion.button
                            onClick={() => handleOpenBooking(room)}
                            disabled={room.status !== 0}
                            whileHover={room.status === 0 ? { scale: 1.04, boxShadow: "0 4px 20px rgba(229,193,88,0.3)" } : {}}
                            whileTap={room.status === 0 ? { scale: 0.95 } : {}}
                            className={`px-4 py-2 text-xs font-extrabold rounded-xl uppercase tracking-wide transition-all duration-200
                                        ${room.status === 0
                                ? "bg-gradient-to-r from-[#e5c158] to-[#d4af37] text-black shadow-[0_3px_12px_rgba(229,193,88,0.2)]"
                                : "bg-slate-700 text-slate-500 cursor-not-allowed"
                              }`}
                          >
                            {room.status === 0 ? "Đặt ngay" : "Hết phòng"}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Phân trang phòng */}
          {roomPagination && (
            <Pagination
              currentPage={roomPagination.currentPage}
              totalPages={roomPagination.totalPages}
              onPageChange={setRoomPage}
            />
          )}
        </section>

        {/* ── Đánh giá của khách ── */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-white border-b border-slate-800 pb-4 mb-6">
            Đánh giá của khách{" "}
            {reviewPagination && (
              <span className="text-sm text-slate-400 font-normal">
                ({reviewPagination.totalItems} đánh giá)
              </span>
            )}
          </h2>

          {/* Rating summary bar */}
          {avgRatingNum > 0 && (
            <div className="bg-[#0f1736] rounded-2xl border border-slate-800/50 p-6 mb-6 flex items-center gap-8">
              <div className="text-center">
                <p className="text-5xl font-extrabold text-[#e5c158]">{avgRating}</p>
                <StarRating rating={Math.round(avgRatingNum)} />
                <p className="text-xs text-slate-400 mt-1">
                  {reviewPagination?.totalItems || reviews.length} đánh giá
                </p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r: any) => Math.round(r.rating) === star).length;
                  const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-slate-400 text-right">{star}</span>
                      <span className="text-[#e5c158] text-[10px]">★</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#e5c158] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-slate-500">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="bg-[#0f1736] border border-dashed border-slate-700 rounded-2xl p-12 text-center">
              <p className="text-slate-400">Chưa có đánh giá nào cho khách sạn này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reviews.map((r: any, idx: number) => {
                const guestName = r.users?.full_name || "Khách hàng";
                const initials = guestName
                  .split(" ")
                  .slice(-2)
                  .map((w: string) => w[0]?.toUpperCase() || "")
                  .join("");
                const dateStr = r.created_at
                  ? new Date(r.created_at).toLocaleDateString("vi-VN")
                  : "";
                return (
                  <motion.div
                    key={r.review_id || idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="bg-[#0f1736] p-5 rounded-2xl border border-slate-800/40 hover:border-slate-700/60 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e5c158]/20 to-[#d4af37]/10 border border-[#e5c158]/20 flex items-center justify-center text-[#e5c158] font-bold text-xs shrink-0">
                        {initials || "KH"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{guestName}</span>
                          <StarRating rating={r.rating || 5} />
                        </div>
                        {dateStr && (
                          <p className="text-[10px] text-slate-500 mt-0.5">{dateStr}</p>
                        )}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-slate-300 text-sm italic leading-relaxed">
                        "{r.comment}"
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Phân trang reviews */}
          {reviewPagination && (
            <Pagination
              currentPage={reviewPagination.currentPage}
              totalPages={reviewPagination.totalPages}
              onPageChange={setReviewPage}
            />
          )}
        </section>
      </div>
    </div>
  );
}
