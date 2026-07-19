"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getHotelsAPI } from "../../services/api";
import { setHotels, setLoading } from "../../redux/slices/hotelSlice";
import { motion } from "framer-motion";
import Link from "next/link";

// ==================== SKELETON CHO HOTEL CARDS ====================
function HotelCardSkeleton() {
  return (
    <div className="bg-[#0f1736] rounded-3xl overflow-hidden border border-slate-800/40">
      <div className="h-52 skeleton" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="flex gap-2">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
        <div className="border-t border-slate-800 pt-3 flex justify-between items-end">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-5 w-28 rounded" />
        </div>
      </div>
    </div>
  );
}

// ==================== ANIMATION VARIANTS ====================
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

// ==================== HELPER ====================
function calcAvgRating(reviews: any[]) {
  if (!reviews || reviews.length === 0) return null;
  const valid = reviews.filter((r: any) => r.rating !== null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc: number, r: any) => acc + r.rating, 0);
  return (sum / valid.length).toFixed(1);
}

// Tính giá phòng rẻ nhất từ danh sách phòng của khách sạn
function getMinPrice(rooms: any[]): number {
  if (!rooms || rooms.length === 0) return 0;
  const prices = rooms.map((r: any) => Number(r.price_per_night)).filter((p: number) => p > 0);
  return prices.length > 0 ? Math.min(...prices) : 0;
}

// Lấy room_id của phòng rẻ nhất (dùng cho link đặt phòng)
function getCheapestRoomId(rooms: any[]): number | null {
  if (!rooms || rooms.length === 0) return null;
  const available = rooms.filter((r: any) => Number(r.price_per_night) > 0);
  if (available.length === 0) return null;
  return available.reduce((min: any, r: any) => 
    Number(r.price_per_night) < Number(min.price_per_night) ? r : min
  ).room_id;
}

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500&auto=format&fit=crop&q=60",
];

// ==================== POPULAR DESTINATIONS (Tĩnh) ====================
const popularDestinations = [
  { id: 1, name: "Hà Nội", count: "1.234 khách sạn", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60" },
  { id: 2, name: "Đà Nẵng", count: "890 khách sạn", image: "https://images.unsplash.com/photo-1559592413-7ece35936575?w=500&auto=format&fit=crop&q=60" },
  { id: 3, name: "Nha Trang", count: "643 khách sạn", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60" },
  { id: 4, name: "Phú Quốc", count: "532 khách sạn", image: "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?w=500&auto=format&fit=crop&q=60" },
];

const RECOMMENDED_CITIES = [
  "Hà Nội", "Đà Nẵng", "Nha Trang", "Phú Quốc", 
  "Hội An", "Sa Pa", "TP. Hồ Chí Minh", "Vũng Tàu", "Đà Lạt"
];

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const hotelList = useSelector((state: any) => state.hotels?.list || []);
  const loading = useSelector((state: any) => state.hotels?.loading ?? true);

  const [destination, setDestination] = useState("Hà Nội");
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [guestInfo, setGuestInfo] = useState("2 khách, 1 phòng");

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));
      try {
        const data = await getHotelsAPI();
        dispatch(setHotels(data));
      } catch (error) {
        console.error("Lỗi gọi API Hotels:", error);
        dispatch(setLoading(false));
      }
    };
    fetchData();
  }, [dispatch]);

  return (
    <div className="bg-[#070c1e] min-h-screen font-sans pb-24 text-white selection:bg-[#e5c158] selection:text-black">

      {/* ═══════════════ SECTION 1: HERO BANNER ═══════════════ */}
      <section
        className="relative h-[560px] w-full bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop&q=80')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#070c1e]/60 to-[#070c1e]" />

        <div className="relative z-10 max-w-6xl w-full px-4 text-white mt-8">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 font-serif"
          >
            Khám phá thế giới <br /> Đặt phòng dễ dàng
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-slate-300 mb-8 max-w-lg"
          >
            Hàng ngàn khách sạn ưu đãi tốt nhất dành cho bạn
          </motion.p>

          {/* FORM TÌM KIẾM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#0f1631]/95 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.3)] text-white flex flex-col md:flex-row items-center gap-4 border border-slate-700/40 relative"
          >
            {/* Điểm đến với Dropdown gợi ý */}
            <div className="flex-1 w-full md:border-r border-slate-700/50 pr-3 relative">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">Điểm đến</label>
              <input
                type="text"
                placeholder="Bạn muốn đến đâu?"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowDestDropdown(true);
                }}
                onFocus={() => setShowDestDropdown(true)}
                className="w-full bg-transparent text-sm outline-none font-medium text-white placeholder-slate-500 transition-colors duration-300 focus:placeholder-slate-400 cursor-pointer"
              />
              {showDestDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowDestDropdown(false)} />
                  <div className="absolute left-0 top-full mt-3 w-72 bg-[#111e38] border border-blue-900/60 rounded-2xl shadow-2xl p-3 z-30 max-h-64 overflow-y-auto text-left">
                    <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-blue-900/40">
                      🌟 Gợi ý điểm đến phổ biến
                    </p>
                    <div className="space-y-1">
                      {RECOMMENDED_CITIES
                        .filter(c => !destination || c.toLowerCase().includes(destination.toLowerCase()))
                        .map(city => (
                          <div
                            key={city}
                            onClick={() => {
                              setDestination(city);
                              setShowDestDropdown(false);
                            }}
                            className="px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-[#e5c158] hover:text-black transition cursor-pointer flex items-center justify-between"
                          >
                            <span>📍 {city}</span>
                            <span className="text-[10px] opacity-70">Chọn →</span>
                          </div>
                        ))}
                      {RECOMMENDED_CITIES.filter(c => !destination || c.toLowerCase().includes(destination.toLowerCase())).length === 0 && (
                        <div className="p-3 text-xs text-slate-400 text-center">
                          Tìm kiếm theo: "{destination}"
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Nhận phòng (Date picker) */}
            <div className="w-full md:w-44 md:border-r border-slate-700/50 pr-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">Nhận phòng</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full bg-transparent text-sm outline-none font-medium text-white cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* Trả phòng (Date picker) */}
            <div className="w-full md:w-44 md:border-r border-slate-700/50 pr-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">Trả phòng</label>
              <input
                type="date"
                value={checkOutDate}
                min={checkInDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-transparent text-sm outline-none font-medium text-white cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* Khách & Phòng */}
            <div className="w-full md:w-56 md:border-r border-slate-700/50 pr-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-widest">Khách &amp; Phòng</label>
              <select
                value={guestInfo}
                onChange={(e) => setGuestInfo(e.target.value)}
                className="w-full text-sm outline-none font-medium text-white bg-transparent cursor-pointer [color-scheme:dark]"
              >
                <option className="bg-[#0f1631]">2 khách, 1 phòng</option>
                <option className="bg-[#0f1631]">1 khách, 1 phòng</option>
                <option className="bg-[#0f1631]">4 khách, 2 phòng</option>
              </select>
            </div>

            {/* Nút Tìm Kiếm */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                router.push(`/hotels?city=${encodeURIComponent(destination)}&checkin=${checkInDate}&checkout=${checkOutDate}`);
              }}
              className="w-full md:w-auto bg-gradient-to-r from-[#e5c158] to-[#d4af37] text-black font-bold px-8 py-4 rounded-2xl 
                         transition-all duration-300 
                         shadow-[0_4px_20px_rgba(229,193,88,0.2)]
                         hover:shadow-[0_8px_32px_rgba(229,193,88,0.35)] whitespace-nowrap cursor-pointer"
            >
              Tìm kiếm
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SECTION 2: ĐIỂM ĐẾN PHỔ BIẾN ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 mt-24 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-bold text-[#e5c158] tracking-[0.2em] uppercase block mb-3"
        >
          Địa điểm nổi bật
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl text-white font-light tracking-wide mb-12 font-serif"
        >
          Những điểm đến <span className="italic text-[#e5c158] font-normal">được yêu thích</span>
        </motion.h2>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {popularDestinations.map((dest, index) => (
            <Link key={dest.id} href={`/hotels?city=${encodeURIComponent(dest.name)}`}>
              <motion.div
                variants={cardItem}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative h-[320px] md:h-[460px] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer border border-slate-800/30
                           transition-all duration-500
                           hover:border-[#e5c158]/20 hover:shadow-[0_16px_48px_rgba(229,193,88,0.08)] block h-full"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070c1e]/90 via-[#070c1e]/25 to-transparent" />
                <div className="absolute bottom-6 left-6 text-left space-y-1.5">
                  <h3 className="font-medium text-xl md:text-2xl text-white font-serif drop-shadow-lg">
                    {dest.name}
                  </h3>
                  <p className="text-xs md:text-sm text-[#e5c158] font-medium tracking-wide">
                    {dest.count}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════ SECTION 3: KHÁCH SẠN TỪ DATABASE ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 mt-24">
        <div className="flex justify-between items-end mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-bold text-[#e5c158] tracking-[0.2em] uppercase block mb-2">
              Dành cho bạn
            </span>
            <h2 className="text-2xl md:text-3xl font-light font-serif text-white">
              Khách sạn <span className="italic text-[#e5c158] font-normal">nổi bật</span>
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Dữ liệu được đồng bộ trực tiếp từ hệ thống PostgreSQL
            </p>
          </motion.div>
          <Link
            href="/hotel"
            className="text-sm font-semibold text-[#e5c158] hover:underline underline-offset-4 transition-all duration-300 hover:text-[#d4af37]"
          >
            Xem tất cả →
          </Link>
        </div>

        {/* SKELETON LOADING */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        ) : hotelList.length === 0 ? (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1736] border border-dashed border-slate-800 rounded-3xl p-14 text-center"
          >
            <div className="text-5xl mb-4">🏨</div>
            <p className="font-medium text-lg text-white">Chưa có khách sạn nào hoặc Server BE chưa bật!</p>
            <p className="text-sm text-slate-500 mt-1">Vui lòng khởi chạy server Node.js và kiểm tra database PostgreSQL.</p>
          </motion.div>
        ) : (
          /* HOTEL CARDS */
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {hotelList.slice(0, 8).map((hotel: any, index: number) => {
              const avgRating = calcAvgRating(hotel.reviews);
              const ratingScore = avgRating || "—";
              const reviewCount = hotel.reviews?.length || 0;
              const imageUrl =
                hotel.hotel_images && hotel.hotel_images.length > 0
                  ? hotel.hotel_images[0].image_url
                  : PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
              const starCount = hotel.star_rating || 0;
              // Lấy giá phòng rẻ nhất thật từ DB
              const minPrice = getMinPrice(hotel.rooms || []);
              const cheapestRoomId = getCheapestRoomId(hotel.rooms || []);

              return (
                <motion.div
                  key={hotel.hotel_id}
                  variants={cardItem}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="bg-[#0f1736] rounded-3xl overflow-hidden border border-slate-800/40 
                             shadow-[0_4px_24px_rgba(0,0,0,0.2)]
                             transition-all duration-500
                             hover:border-[#e5c158]/20 
                             hover:shadow-[0_12px_40px_rgba(229,193,88,0.08)]
                             flex flex-col justify-between group cursor-pointer"
                >
                  {/* Ảnh */}
                  <div className="relative h-52 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={hotel.hotel_name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Star badge */}
                    {starCount > 0 && (
                      <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-[#e5c158] font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1">
                        {"★".repeat(Math.min(starCount, 5))}
                      </span>
                    )}

                    {/* Favorite button */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center 
                                       text-white/70 transition-all duration-300
                                       hover:text-red-400 hover:bg-black/50 hover:scale-110
                                       active:scale-90">
                      ♥
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base line-clamp-1 mb-1.5 transition-colors duration-300 group-hover:text-[#e5c158]">
                        {hotel.hotel_name || "Chưa đặt tên"}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                        <span className="text-[#e5c158]">⭐ {ratingScore}</span>
                        <span className="text-slate-600">•</span>
                        <span>{reviewCount > 0 ? `${reviewCount} đánh giá` : "Mới"}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 line-clamp-1">
                        <span className="opacity-60">📍</span>
                        {hotel.city || hotel.address || "Việt Nam"}
                      </p>
                    </div>

                    {/* Giá + Nút hành động — Premium UI với spacing chuẩn */}
                    <div className="mt-5 pt-4 border-t border-slate-800/60">
                      {/* Dòng giá */}
                      <div className="mb-3">
                        {minPrice > 0 ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[#e5c158] font-extrabold text-xl leading-none">
                              {new Intl.NumberFormat("vi-VN").format(minPrice)}đ
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">/đêm</span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[#e5c158] font-extrabold text-xl leading-none">Liên hệ</span>
                            <span className="text-[11px] text-slate-500 font-medium">để biết giá</span>
                          </div>
                        )}
                      </div>
                      {/* Hai nút hành động */}
                      <div className="flex items-center gap-2.5">
                        <Link href={`/hotels/${hotel.hotel_id}`} className="flex-1">
                          <motion.button
                            whileHover={{ scale: 1.03, backgroundColor: "rgba(148,163,184,0.12)" }}
                            whileTap={{ scale: 0.96 }}
                            className="w-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white
                                       text-[11px] font-bold px-3 py-2.5 rounded-xl
                                       transition-all duration-200
                                       hover:border-slate-600 hover:shadow-[0_0_12px_rgba(148,163,184,0.08)]
                                       active:scale-95"
                          >
                            Xem chi tiết
                          </motion.button>
                        </Link>
                        <Link
                          href={cheapestRoomId
                            ? `/hotels/${hotel.hotel_id}/rooms/${cheapestRoomId}`
                            : `/hotels/${hotel.hotel_id}`}
                          className="flex-1"
                        >
                          <motion.button
                            whileHover={{
                              scale: 1.03,
                              boxShadow: "0 6px 24px rgba(229,193,88,0.35)"
                            }}
                            whileTap={{ scale: 0.96 }}
                            className="w-full bg-gradient-to-r from-[#e5c158] to-[#d4af37]
                                       text-black text-[11px] font-extrabold px-3 py-2.5 rounded-xl
                                       shadow-[0_3px_12px_rgba(229,193,88,0.2)]
                                       transition-all duration-200
                                       active:scale-95"
                          >
                            Đặt phòng
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* ═══════════════ SECTION 4: CAM KẾT TRẢI NGHIỆM ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 mt-24 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-bold text-[#e5c158] tracking-[0.2em] uppercase block mb-3"
        >
          Tại sao chọn chúng tôi
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl text-white font-light tracking-wide mb-12 font-serif"
        >
          Cam kết <span className="italic text-[#e5c158] font-normal">trải nghiệm</span> hoàn hảo
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { icon: "🛡️", title: "Thanh toán an toàn", desc: "Bảo mật SSL 256-bit, hỗ trợ nhiều phương thức thanh toán uy tín" },
            { icon: "🕒", title: "Hỗ trợ 24/7", desc: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào" },
            { icon: "👍", title: "Giá tốt nhất", desc: "Cam kết giá tốt nhất, hoàn tiền nếu tìm thấy giá thấp hơn" },
            { icon: "🏅", title: "Khách sạn chọn lọc", desc: "Hơn 50.000 khách sạn được kiểm duyệt chất lượng trên khắp Việt Nam" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={cardItem}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="bg-[#0f1736] border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center text-center 
                         transition-all duration-500 group cursor-pointer
                         hover:border-[#e5c158]/20 hover:shadow-[0_8px_32px_rgba(229,193,88,0.06)]"
            >
              <div className="w-14 h-14 rounded-2xl border border-slate-700/60 flex items-center justify-center mb-6 text-2xl
                              transition-all duration-300
                              group-hover:bg-[#e5c158]/10 group-hover:border-[#e5c158]/30 group-hover:shadow-[0_0_20px_rgba(229,193,88,0.1)]">
                {item.icon}
              </div>
              <h3 className="font-bold text-lg text-white mb-3 transition-colors duration-300 group-hover:text-[#e5c158]">
                {item.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════ SECTION 5: BANNER ƯU ĐÃI ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 mt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative w-full rounded-3xl overflow-hidden min-h-[360px] flex items-center bg-[#0d1430] border border-slate-800/60
                     hover:border-slate-700/60 transition-all duration-500"
        >
          <div
            className="absolute inset-0 bg-cover bg-right md:bg-right opacity-35 mix-blend-luminosity"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&auto=format&fit=crop&q=60')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1430] via-[#0d1430]/90 to-transparent" />

          <div className="relative z-10 p-8 md:p-16 max-w-2xl">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-block bg-yellow-500/10 border border-[#e5c158]/30 text-[#e5c158] text-xs font-bold px-4 py-1.5 rounded-full mb-6"
            >
              ✨ Ưu đãi giới hạn
            </motion.span>
            <h2 className="text-3xl md:text-4xl text-white font-light mb-4 font-serif leading-tight">
              Giảm đến <span className="text-[#e5c158] font-bold">40%</span> cho đặt phòng sớm
            </h2>
            <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed">
              Đặt phòng trước 30 ngày để nhận ưu đãi tốt nhất tại hơn 500 khách sạn 5 sao trên toàn Việt Nam.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-[#e5c158] to-[#d4af37] text-black font-bold px-8 py-4 rounded-2xl 
                         transition-all duration-300 
                         shadow-[0_4px_20px_rgba(229,193,88,0.2)]
                         hover:shadow-[0_8px_32px_rgba(229,193,88,0.35)]"
            >
              Đặt ngay hôm nay
            </motion.button>
          </div>
        </motion.div>
      </section>

    </div>
  );
}