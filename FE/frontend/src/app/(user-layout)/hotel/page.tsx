// src/app/(user-layout)/hotel/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getHotelsAPI } from "../../../services/api";
import { setHotels, setLoading, setError } from "../../../redux/slices/hotelSlice";
import { motion } from "framer-motion";
import Link from "next/link";

// ==================== SKELETON COMPONENT ====================
function HotelCardSkeleton() {
  return (
    <div className="bg-[#0f1631] border border-slate-900/60 rounded-3xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[300px]">
      <div className="w-full md:w-[38%] h-52 md:h-full skeleton flex-shrink-0" />
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="skeleton h-4 w-32 rounded-lg" />
          <div className="skeleton h-6 w-3/4 rounded-lg" />
          <div className="skeleton h-3 w-1/2 rounded-lg" />
          <div className="skeleton h-3 w-full rounded-lg mt-2" />
          <div className="skeleton h-3 w-4/5 rounded-lg" />
          <div className="flex gap-2 mt-3">
            {[1,2,3,4].map((i) => (<div key={i} className="skeleton h-6 w-16 rounded-lg" />))}
          </div>
        </div>
        <div className="border-t border-slate-800/40 pt-4 flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className="skeleton w-11 h-11 rounded-xl" />
            <div className="space-y-1.5">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-2.5 w-20 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-1.5 text-right">
              <div className="skeleton h-6 w-28 rounded-lg" />
              <div className="skeleton h-2.5 w-20 rounded ml-auto" />
            </div>
            <div className="skeleton h-11 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== ANIMATION VARIANTS ====================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

// ==================== HELPER ====================
function normalizeVietnamese(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function calcAvgRating(reviews: any[]) {
  if (!reviews || reviews.length === 0) return null;
  const valid = reviews.filter((r: any) => r.rating !== null && r.rating !== undefined);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc: number, r: any) => acc + r.rating, 0);
  return (sum / valid.length).toFixed(1);
}
function getRatingText(score: number) {
  if (score >= 4.5) return "Xuat sac";
  if (score >= 4.0) return "Rat tot";
  if (score >= 3.5) return "Tot";
  if (score >= 3.0) return "Kha";
  return "Trung binh";
}
function getMinPrice(hotel: any): number {
  if (!hotel.rooms || hotel.rooms.length === 0) return 0;
  const prices = hotel.rooms.map((r: any) => Number(r.price_per_night)).filter((p: number) => p > 0);
  return prices.length > 0 ? Math.min(...prices) : 0;
}

// ==================== CONSTANTS ====================
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=80",
];
const TAG_ICONS: Record<string, string> = {
  "WiFi": "📶", "Bua sang": "🍳", "Do xe": "🅿️", "Ho boi": "🏊", "Spa": "💆", "Gym": "🏋️", "default": "✨",
};
const AMENITY_LIST = ["WiFi mien phi", "Bua sang", "Do xe", "Ho boi", "Spa", "Phong gym", "Bai bien rieng"];
const DEFAULT_TAGS = ["WiFi", "Bua sang", "Do xe", "Ho boi", "Spa"];

// ==================== MAIN COMPONENT ====================
function HotelContent() {
  const dispatch = useDispatch();
  const hotelList = useSelector((state: any) => state.hotels?.list || []);
  const loading = useSelector((state: any) => state.hotels?.loading ?? true);
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedCity, setSelectedCity] = useState("Tat ca");
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    const cityParam = searchParams ? searchParams.get("city") : null;
    const searchParam = searchParams ? searchParams.get("search") : null;
    if (cityParam) setSelectedCity(cityParam);
    if (searchParam) setSearchTerm(searchParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchHotels = async () => {
      dispatch(setLoading(true));
      try {
        const data = await getHotelsAPI();
        dispatch(setHotels(data));
      } catch (error) {
        console.error("Loi goi API Hotels:", error);
        dispatch(setError("Khong the tai danh sach khach san"));
      }
    };
    fetchHotels();
  }, [dispatch]);

  const toggleStar = (star: number) => {
    setSelectedStars((prev) => prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]);
  };
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]);
  };
  const resetFilters = () => { setSelectedStars([]); setSelectedAmenities([]); setMaxPrice(10000000); };

  const filteredHotels = hotelList
    .filter((hotel: any) => {
      const normSearch = normalizeVietnamese(searchTerm);
      const matchSearch =
        !normSearch ||
        normalizeVietnamese(hotel.hotel_name || "").includes(normSearch) ||
        normalizeVietnamese(hotel.address || "").includes(normSearch) ||
        normalizeVietnamese(hotel.city || "").includes(normSearch);
      const matchCity =
        selectedCity === "Tat ca" ||
        !selectedCity ||
        normalizeVietnamese(hotel.city || "") === normalizeVietnamese(selectedCity) ||
        normalizeVietnamese(hotel.city || "").includes(normalizeVietnamese(selectedCity));
      const matchStar = selectedStars.length === 0 || selectedStars.includes(Number(hotel.star_rating));
      const minPrice = getMinPrice(hotel);
      const matchPrice = minPrice === 0 || minPrice <= maxPrice;
      return matchSearch && matchCity && matchStar && matchPrice;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "price-asc") return getMinPrice(a) - getMinPrice(b);
      if (sortBy === "price-desc") return getMinPrice(b) - getMinPrice(a);
      if (sortBy === "rating") {
        const rA = calcAvgRating(a.reviews) || 0;
        const rB = calcAvgRating(b.reviews) || 0;
        return Number(rB) - Number(rA);
      }
      return 0;
    });

  const allCities: string[] = ["Tat ca", ...Array.from(new Set(hotelList.map((h: any) => h.city).filter(Boolean) as string[]))];
  const displayCities = allCities.length > 1 ? allCities : ["Tat ca", "Ha Noi", "Da Nang", "Hoi An", "Phu Quoc", "Nha Trang", "Sapa"];
  const hasActiveFilters = selectedStars.length > 0 || selectedAmenities.length > 0 || maxPrice < 10000000;

  return (
    <div className="bg-[#070c1e] text-white min-h-screen pb-16 font-sans">
      <motion.div className="max-w-7xl mx-auto px-6 pt-12 pb-8" variants={headerVariants} initial="hidden" animate="visible">
        <span className="text-xs font-bold text-[#e5c158] tracking-widest uppercase block mb-2">Tim kiem</span>
        <h1 className="text-3xl font-serif font-light mb-8">
          Tim <span className="italic text-[#e5c158] font-normal">khach san</span> phu hop
        </h1>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e5c158] transition-colors">🔍</span>
            <input
              type="text" placeholder="Tim theo ten khach san hoac dia diem..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111836] border border-slate-800 text-sm rounded-2xl pl-11 pr-4 py-4 text-white outline-none placeholder-slate-500 transition-all focus:border-[#e5c158]/50 hover:border-slate-700"
            />
          </div>
          <select
            value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#111836] border border-slate-800 text-sm rounded-2xl px-5 py-4 text-slate-300 outline-none [color-scheme:dark] min-w-[160px] cursor-pointer hover:border-slate-700 focus:border-[#e5c158]/50"
          >
            <option value="default">De xuat</option>
            <option value="rating">Danh gia cao nhat</option>
            <option value="price-asc">Gia thap den cao</option>
            <option value="price-desc">Gia cao xuong thap</option>
          </select>
        </div>
        <motion.p className="text-xs text-slate-400 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Tim thay <span className="text-[#e5c158] font-bold">{loading ? "..." : filteredHotels.length}</span> khach san phu hop
          {selectedStars.length > 0 && <span className="ml-2 text-[#e5c158]">• Dang loc: {selectedStars.join(", ")} sao</span>}
        </motion.p>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* BỘ LỌC */}
        <motion.aside
          className="bg-[#0f1631]/80 backdrop-blur-sm border border-slate-900/80 rounded-3xl p-6 space-y-7 sticky top-20"
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h2 className="text-base font-bold text-slate-200 tracking-wide uppercase">Bo loc</h2>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-[10px] text-[#e5c158] hover:underline">Dat lai</button>
            )}
          </div>

          {/* Thanh pho */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Thanh pho</label>
            <div className="flex flex-wrap gap-2">
              {displayCities.map((city: string, idx: number) => {
                const isSelected = city === selectedCity || (selectedCity !== "Tat ca" && city !== "Tat ca" && normalizeVietnamese(city) === normalizeVietnamese(selectedCity));
                return (
                  <motion.span key={idx} onClick={() => setSelectedCity(city)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={`text-xs px-3.5 py-2 rounded-xl cursor-pointer transition-all ${isSelected ? "bg-[#e5c158] text-black font-bold" : "bg-[#161f44] text-slate-300 hover:bg-[#1f2b5c] hover:text-white"}`}
                  >{city}</motion.span>
                );
              })}
            </div>
          </div>

          {/* Hang sao — co state that */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Hang sao</label>
            <div className="flex gap-2">
              {[3, 4, 5].map((star) => (
                <motion.button key={star} id={`star-filter-${star}`} onClick={() => toggleStar(star)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  className={`border text-xs px-4 py-2 rounded-xl transition-all ${selectedStars.includes(star) ? "border-[#e5c158] text-[#e5c158] bg-yellow-500/10 font-bold" : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white"}`}
                >{star} ⭐</motion.button>
              ))}
            </div>
            {selectedStars.length > 0 && (
              <p className="text-[10px] text-[#e5c158]/70">Dang loc: {selectedStars.sort().join(", ")} sao</p>
            )}
          </div>

          {/* Gia toi da — hoat dong that */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Gia toi da/dem</span>
              <span className="text-[#e5c158] normal-case">{new Intl.NumberFormat("vi-VN").format(maxPrice)}d</span>
            </div>
            <input
              type="range" min={500000} max={10000000} step={100000} value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 appearance-none rounded-full cursor-pointer mt-2"
              style={{ background: `linear-gradient(to right, #e5c158 0%, #e5c158 ${((maxPrice - 500000) / 9500000) * 100}%, #1e293b ${((maxPrice - 500000) / 9500000) * 100}%, #1e293b 100%)` }}
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>500K</span>
              <span className="text-[#e5c158] font-bold">10.0M</span>
            </div>
          </div>

          {/* Tien ich — co state that */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Tien ich</label>
            <div className="space-y-3 text-xs text-slate-300">
              {AMENITY_LIST.map((fac, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer hover:text-white transition-all group">
                  <input type="checkbox" id={`amenity-${idx}`} checked={selectedAmenities.includes(fac)}
                    onChange={() => toggleAmenity(fac)}
                    className="w-4 h-4 rounded-md accent-[#e5c158] cursor-pointer"
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform">{fac}</span>
                </label>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* DANH SACH KHACH SAN */}
        <div className="lg:col-span-3 space-y-7">
          {loading ? (
            <div className="space-y-7">{[1,2,3,4].map((i) => <HotelCardSkeleton key={i} />)}</div>
          ) : filteredHotels.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f1736] border border-dashed border-slate-800 rounded-3xl p-16 text-center">
              <div className="text-5xl mb-4">🏨</div>
              <p className="font-medium text-lg text-white mb-2">Khong tim thay khach san nao</p>
              <p className="text-sm text-slate-500">
                {hotelList.length === 0 ? "Vui long khoi chay server Backend va kiem tra database PostgreSQL." : "Thu thay doi tu khoa tim kiem hoac bo loc."}
              </p>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="mt-4 text-xs text-[#e5c158] border border-[#e5c158]/30 px-4 py-2 rounded-xl hover:bg-[#e5c158]/10 transition-all">
                  Xoa bo loc
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div className="space-y-7" variants={containerVariants} initial="hidden" animate="visible">
              {filteredHotels.map((hotel: any, index: number) => {
                const avgRating = calcAvgRating(hotel.reviews);
                const ratingScore = avgRating || "N/A";
                const ratingText = avgRating ? getRatingText(parseFloat(avgRating)) : "Chua co";
                const reviewCount = hotel.reviews?.length || 0;
                const imageUrl = hotel.hotel_images?.length > 0 ? hotel.hotel_images[0].image_url : PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
                const starCount = hotel.star_rating || 0;
                const minPrice = getMinPrice(hotel);
                let badge = "";
                if (avgRating && parseFloat(avgRating) >= 4.8) badge = "Xuat sac";
                else if (reviewCount > 100) badge = "Pho bien";
                else if (hotel.status === 0) badge = "Moi";

                return (
                  <motion.div key={hotel.hotel_id} variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.25 } }}
                    className="bg-[#0f1631] border border-slate-900/60 rounded-3xl overflow-hidden group transition-all hover:border-[#e5c158]/20 hover:shadow-[0_8px_40px_rgba(229,193,88,0.06)] flex flex-col md:flex-row h-auto md:h-[300px]">
                    {/* Anh */}
                    <div className="w-full md:w-[38%] h-56 md:h-full relative overflow-hidden flex-shrink-0">
                      <img src={imageUrl} alt={hotel.hotel_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {badge && (
                        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          className="absolute top-4 left-4 bg-[#e5c158] text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg">
                          {badge}
                        </motion.span>
                      )}
                      <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-red-400 transition-all">♥</button>
                    </div>

                    {/* Noi dung */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-400 mb-2">
                          <div className="flex text-[#e5c158]">{Array.from({ length: starCount }).map((_, i) => <span key={i}>★</span>)}</div>
                          {starCount > 0 && <span className="w-1 h-1 bg-slate-700 rounded-full" />}
                          <span className="bg-[#161f44] px-2.5 py-1 rounded-lg text-[10px] text-[#e5c158] font-medium">{starCount >= 4 ? "Resort" : "Khach san"}</span>
                        </div>
                        <h3 className="font-serif font-bold text-lg md:text-xl text-white group-hover:text-[#e5c158] transition-colors">{hotel.hotel_name}</h3>
                        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                          <span>📍</span>{hotel.address}{hotel.city ? `, ${hotel.city}` : ""}
                        </p>
                        {hotel.description && (
                          <p className="text-xs text-slate-400/70 mt-3 line-clamp-2 leading-relaxed">{hotel.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {DEFAULT_TAGS.slice(0, 5).map((tag, idx) => (
                            <span key={idx} className="bg-[#111836]/80 border border-slate-800/60 text-[10px] text-slate-400 px-3 py-1.5 rounded-lg hover:border-[#e5c158]/30 hover:text-[#e5c158]/80 transition-all">
                              {TAG_ICONS[tag] || TAG_ICONS["default"]} {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-800/40 pt-4 flex justify-between items-end mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e5c158] to-[#d4af37] flex items-center justify-center text-black font-black text-sm">{ratingScore}</div>
                          <div>
                            <p className="text-xs font-bold text-white">{ratingText}</p>
                            <p className="text-[10px] text-slate-500">{reviewCount > 0 ? `${reviewCount} danh gia` : "Chua co danh gia"}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            {minPrice > 0 ? (
                              <>
                                <p className="text-[10px] text-slate-500">Tu</p>
                                <p className="text-[#e5c158] font-black text-xl">{new Intl.NumberFormat("vi-VN").format(minPrice)}d</p>
                                <p className="text-[10px] text-slate-500">/dem, da gom thue</p>
                              </>
                            ) : (
                              <p className="text-[#e5c158] font-black text-xl">Lien he</p>
                            )}
                          </div>
                          <Link href={`/hotel/${hotel.hotel_id}`}>
                            <motion.button id={`view-hotel-${hotel.hotel_id}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-[#e5c158] to-[#d4af37] text-black text-xs font-extrabold px-6 py-3 rounded-xl shadow-[0_4px_20px_rgba(229,193,88,0.15)] hover:shadow-[0_8px_32px_rgba(229,193,88,0.3)] transition-all">
                              Xem phong
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
        </div>
      </div>
    </div>
  );
}

export default function HotelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070c1e] text-white flex items-center justify-center">Đang tải danh sách khách sạn...</div>}>
      <HotelContent />
    </Suspense>
  );
}
