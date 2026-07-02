"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  getHotelsAPI,
  getRoomsByHotelAPI,
  getAllBookingsAPI,
  getOwnerStatsAPI,
  getReviewsByHotelAPI,
  updateStatusBookingAPI
} from "../../../services/api";
import { formatCurrencyVND } from "../../../utils/dataMappers";
import { motion, AnimatePresence } from "framer-motion";

// ── Pagination Component (reusable) ──
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-2 mt-6">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-30 hover:bg-slate-700 transition">
        ‹ Trước
      </button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-7 h-7 rounded-lg text-xs font-bold transition ${p === currentPage ? "bg-[#fbbf24] text-slate-950 shadow" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>{p}</button>
      ))}
      {totalPages > 7 && <span className="text-slate-500 text-xs">...</span>}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-30 hover:bg-slate-700 transition">
        Sau ›
      </button>
    </div>
  );
}

export default function OwnerDashboardPage() {
  const authUser = useSelector((state: any) => state.auth?.user);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Real data state
  const [myHotels, setMyHotels] = useState<any[]>([]);
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);

  // Rooms pagination
  const [roomPage, setRoomPage] = useState(1);
  const [roomPagination, setRoomPagination] = useState<any>(null);

  // Bookings pagination
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingPagination, setBookingPagination] = useState<any>(null);

  // Reviews pagination
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPagination, setReviewPagination] = useState<any>(null);

  // Stats time filter
  const [statsPeriod, setStatsPeriod] = useState<string>("month");
  const [statsStartDate, setStatsStartDate] = useState("");
  const [statsEndDate, setStatsEndDate] = useState("");

  // ── Fetch khách sạn của owner & stats ban đầu
  useEffect(() => {
    const ownerId = authUser?.user_id || authUser?.id;
    if (!ownerId) return;
    const fetchBase = async () => {
      setLoading(true);
      try {
        const [hotelsRes, statsRes]: any[] = await Promise.all([
          getHotelsAPI(1, 100),
          getOwnerStatsAPI({ period: statsPeriod })
        ]);
        const allHotels = Array.isArray(hotelsRes) ? hotelsRes : [];
        let filteredHotels = allHotels.filter((h: any) => h.owner_id === ownerId);
        if (filteredHotels.length === 0) {
          filteredHotels = [{ hotel_id: 0, hotel_name: "Chưa có khách sạn", city: "—", star_rating: 0, status: 0, description: "", hotel_images: [] }];
        }
        setMyHotels(filteredHotels);
        if (!selectedHotelId && filteredHotels[0]?.hotel_id) {
          setSelectedHotelId(filteredHotels[0].hotel_id);
        }
        setStats(statsRes || null);
      } catch (error) {
        console.error("Lỗi fetch khách sạn owner:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBase();
  }, [authUser]);

  // ── Fetch phòng theo hotelId với phân trang
  useEffect(() => {
    const activeHotelId = selectedHotelId || myHotels[0]?.hotel_id;
    if (!activeHotelId || activeHotelId === 0) return;
    const fetchRooms = async () => {
      try {
        const res: any = await getRoomsByHotelAPI(activeHotelId, roomPage, 10);
        const arr = Array.isArray(res) ? res : (res?.data || []);
        setMyRooms(arr);
        if (res?.pagination) setRoomPagination(res.pagination);
      } catch (err) { console.error("Lỗi fetch phòng:", err); }
    };
    fetchRooms();
  }, [myHotels, selectedHotelId, roomPage]);

  // ── Fetch bookings với phân trang
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res: any = await getAllBookingsAPI(bookingPage, 10);
        setMyBookings(res?.data || []);
        if (res?.pagination) setBookingPagination(res.pagination);
      } catch (err) { console.error("Lỗi fetch bookings:", err); }
    };
    fetchBookings();
  }, [bookingPage]);

  // ── Fetch reviews của khách sạn với phân trang
  useEffect(() => {
    const activeHotelId = selectedHotelId || myHotels[0]?.hotel_id;
    if (!activeHotelId || activeHotelId === 0) return;
    const fetchReviews = async () => {
      try {
        const res: any = await getReviewsByHotelAPI(activeHotelId, reviewPage, 10);
        const arr = Array.isArray(res) ? res : (res?.data || []);
        setMyReviews(arr);
        if (res?.pagination) setReviewPagination(res.pagination);
      } catch (err) { console.error("Lỗi fetch reviews:", err); }
    };
    fetchReviews();
  }, [myHotels, selectedHotelId, reviewPage]);

  // ── Fetch stats với bộ lọc thời gian
  const handleFetchStats = async () => {
    const params: any = statsPeriod === "custom"
      ? { startDate: statsStartDate, endDate: statsEndDate }
      : { period: statsPeriod };
    try {
      const res = await getOwnerStatsAPI(params);
      setStats(res);
    } catch (err) { console.error("Lỗi fetch stats:", err); }
  };

  // Cập nhật trạng thái đặt phòng realtime sang BE
  const handleUpdateStatus = async (bookingId: number, newStatus: number) => {
    setUpdatingId(bookingId);
    try {
      await updateStatusBookingAPI(bookingId, newStatus);
      setMyBookings(prev => prev.map(b => b.booking_id === bookingId ? { ...b, status: newStatus } : b));
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái!");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Computed values ──
  const activeHotel = myHotels[0] || { hotel_name: "...", hotel_id: 0 };
  const totalRoomsCount = myRooms.length;
  const availableRoomsCount = myRooms.filter((r: any) => r.status === 0).length;
  const occupancyRate = totalRoomsCount > 0 ? Math.round(((totalRoomsCount - availableRoomsCount) / totalRoomsCount) * 100) : 0;
  const pendingCount = myBookings.filter((b: any) => Number(b.status) === 0).length;
  const totalRevenueCalc = myBookings.reduce((sum: number, b: any) => sum + Number(b.total_price || 0), 0);
  const filteredBookings = filterStatus === "ALL"
    ? myBookings
    : myBookings.filter((b: any) => {
      if (filterStatus === "3") return Number(b.status) === 3 || Number(b.status) === 2;
      return String(b.status) === filterStatus;
    });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try { return new Date(dateStr).toLocaleDateString("vi-VN"); } catch { return dateStr; }
  };

  const getInitials = (name: string) => {
    return name.split(" ").slice(-2).map((w: string) => w[0]?.toUpperCase() || "").join("") || "KH";
  };

  const renderStatusBadge = (status: number | string) => {
    const s = Number(status);
    const map: Record<number, { label: string; cls: string }> = {
      0: { label: "Chờ xác nhận", cls: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
      1: { label: "Đã xác nhận",  cls: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
      2: { label: "Đang lưu trú", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
      3: { label: "Hoàn thành",   cls: "bg-slate-500/10 text-slate-400 border border-slate-500/20" },
    };
    const cfg = map[s] || { label: "Không rõ", cls: "bg-slate-700 text-slate-400" };
    return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.cls}`}>{cfg.label}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fbbf24]"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a1225] text-white overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 shrink-0 bg-[#0d1a2e] border-r border-slate-800/60 flex flex-col shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-800/60">
          <span className="font-black text-lg text-white tracking-tight">
            🏨 <span className="text-[#fbbf24]">Owner</span> Panel
          </span>
          <p className="text-[11px] text-slate-500 mt-1 truncate">{activeHotel.hotel_name}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: "overview",  icon: "🏠", label: "Tổng quan" },
            { id: "bookings",  icon: "📋", label: "Đặt phòng" },
            { id: "rooms",     icon: "🛏️", label: "Phòng & Khách sạn" },
            { id: "revenue",   icon: "📊", label: "Doanh thu" },
            { id: "reviews",   icon: "⭐", label: "Đánh giá" },
            { id: "settings",  icon: "⚙️", label: "Cài đặt" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#fbbf24] text-slate-950 shadow-[0_4px_14px_rgba(251,191,36,0.25)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="px-4 pb-5 pt-3 border-t border-slate-800/60">
          <button
            onClick={() => {
              if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Owner?")) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
              }
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-xl text-sm transition font-semibold"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Header */}
        <header className="px-8 py-4 border-b border-slate-800/60 bg-[#0a1225]/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
          <div className="relative w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b]/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#fbbf24] transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition">
              <span className="text-lg">🔔</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>

            <div className="w-9 h-9 rounded-lg bg-[#fbbf24] text-slate-950 font-black flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition">
              {getInitials(authUser?.full_name || "Owner")}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-8 flex-1">
          <AnimatePresence mode="wait">
            {/* TAB: TỔNG QUAN */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Tổng quan</h2>
                  <p className="text-sm text-slate-400 mt-0.5">{activeHotel.hotel_name}</p>
                </div>

                {/* 4 STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  <div className="bg-[#131f37] border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-400">Phòng trống</span>
                      <div className="w-10 h-10 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24] text-lg">🛏️</div>
                    </div>
                    <div className="text-3xl font-black text-white mt-4 tracking-tight">{availableRoomsCount}/{totalRoomsCount}</div>
                    <p className="text-xs text-slate-400 mt-1">Tỷ lệ lấp đầy {occupancyRate}%</p>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-semibold text-emerald-400 gap-1">
                      <span>↗</span> +5% so với tuần trước
                    </div>
                  </div>

                  <div className="bg-[#131f37] border border-slate-800/80 rounded-2xl p-5 shadow-xl group hover:border-slate-700 transition duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-400">Đặt phòng</span>
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-lg">📅</div>
                    </div>
                    <div className="text-3xl font-black text-white mt-4 tracking-tight">{myBookings.length}</div>
                    <p className="text-xs text-slate-400 mt-1">{pendingCount} chờ xác nhận</p>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-semibold text-emerald-400 gap-1">
                      <span>↗</span> +12% so với hôm qua
                    </div>
                  </div>

                  <div className="bg-[#131f37] border border-slate-800/80 rounded-2xl p-5 shadow-xl group hover:border-slate-700 transition duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-400">Doanh thu tháng này</span>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-lg">$</div>
                    </div>
                    <div className="text-3xl font-black text-white mt-4 tracking-tight">{Math.round(totalRevenueCalc / 1000000)} triệu</div>
                    <p className="text-xs text-slate-400 mt-1">VND</p>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-semibold text-emerald-400 gap-1">
                      <span>↗</span> +24% so với tháng trước
                    </div>
                  </div>

                  <div className="bg-[#131f37] border border-slate-800/80 rounded-2xl p-5 shadow-xl group hover:border-slate-700 transition duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-400">Đánh giá trung bình</span>
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-lg">⭐</div>
                    </div>
                    <div className="text-3xl font-black text-white mt-4 tracking-tight">
                      {myReviews.length > 0
                        ? (myReviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / myReviews.length).toFixed(1)
                        : "—"} ★
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Từ {reviewPagination?.totalItems || myReviews.length} đánh giá</p>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-semibold text-emerald-400 gap-1">
                      <span>↗</span> +0.2 so với tháng trước
                    </div>
                  </div>
                </div>

                {/* RECENT BOOKINGS TABLE */}
                <div className="bg-[#131f37] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Đặt phòng gần đây</h3>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="text-sm font-semibold text-[#fbbf24] hover:underline flex items-center gap-1"
                    >
                      Xem tất cả &gt;
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3.5 pr-4">Khách hàng</th>
                          <th className="pb-3.5 px-4">Phòng</th>
                          <th className="pb-3.5 px-4">Check-in</th>
                          <th className="pb-3.5 px-4">Check-out</th>
                          <th className="pb-3.5 px-4">Tổng tiền</th>
                          <th className="pb-3.5 pl-4 text-right">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {myBookings.slice(0, 6).map((booking) => {
                          const customerName = booking.users?.full_name || "Khách hàng ẩn danh";
                          const roomName = booking.rooms?.room_number || `Phòng ID ${booking.room_id}`;
                          const code = `BK-${booking.booking_id}`;
                          return (
                            <tr key={booking.booking_id} className="hover:bg-slate-800/40 transition duration-150">
                              <td className="py-4 pr-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-[#fbbf24] font-bold text-xs flex items-center justify-center shrink-0">
                                    {getInitials(customerName)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white">{customerName}</div>
                                    <div className="text-xs text-slate-400 font-mono mt-0.5">{code}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-slate-300 font-medium">{roomName}</td>
                              <td className="py-4 px-4 text-slate-400">{formatDate(booking.check_in)}</td>
                              <td className="py-4 px-4 text-slate-400">{formatDate(booking.check_out)}</td>
                              <td className="py-4 px-4 font-bold text-white">{formatCurrencyVND(booking.total_price)}</td>
                              <td className="py-4 pl-4 text-right">{renderStatusBadge(booking.status)}</td>
                            </tr>
                          );
                        })}
                        {myBookings.length === 0 && (
                          <tr><td colSpan={6} className="py-12 text-center text-slate-500">Chưa có đặt phòng nào.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: ĐẶT PHÒNG */}
            {activeTab === "bookings" && (
              <motion.div key="bookings" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Quản lý Đặt phòng</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Duyệt và cập nhật trạng thái nhận/trả phòng của khách</p>
                  </div>
                  <div className="flex flex-wrap gap-2 bg-[#131f37] p-1.5 rounded-xl border border-slate-800">
                    {[
                      { id: "ALL", label: "Tất cả" },
                      { id: "0", label: "Chờ xác nhận" },
                      { id: "1", label: "Đã xác nhận" },
                      { id: "2", label: "Đang lưu trú" },
                      { id: "3", label: "Hoàn thành / Hủy" }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterStatus === tab.id ? "bg-[#fbbf24] text-slate-950 shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#131f37] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3.5 pr-4">Khách hàng</th>
                          <th className="pb-3.5 px-4">Phòng</th>
                          <th className="pb-3.5 px-4">Thời gian</th>
                          <th className="pb-3.5 px-4">Tổng tiền</th>
                          <th className="pb-3.5 px-4">Trạng thái</th>
                          <th className="pb-3.5 pl-4 text-right">Thao tác nhanh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {filteredBookings.map((booking) => {
                          const customerName = booking.users?.full_name || "Khách hàng ẩn danh";
                          const roomName = booking.rooms?.room_number || `Phòng ID ${booking.room_id}`;
                          const code = `BK-${booking.booking_id}`;
                          return (
                            <tr key={booking.booking_id} className="hover:bg-slate-800/40 transition">
                              <td className="py-4 pr-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-[#fbbf24] font-bold text-xs flex items-center justify-center shrink-0">
                                    {getInitials(customerName)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white">{customerName}</div>
                                    <div className="text-xs text-slate-400 font-mono mt-0.5">{code}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-slate-300 font-medium">{roomName}</td>
                              <td className="py-4 px-4 text-xs text-slate-400">
                                <div><span className="text-slate-500">In:</span> {formatDate(booking.check_in)}</div>
                                <div><span className="text-slate-500">Out:</span> {formatDate(booking.check_out)}</div>
                              </td>
                              <td className="py-4 px-4 font-bold text-white">{formatCurrencyVND(booking.total_price)}</td>
                              <td className="py-4 px-4">{renderStatusBadge(booking.status)}</td>
                              <td className="py-4 pl-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {Number(booking.status) === 0 && (
                                    <button disabled={updatingId === booking.booking_id} onClick={() => handleUpdateStatus(booking.booking_id, 1)}
                                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition shadow disabled:opacity-50">
                                      Duyệt
                                    </button>
                                  )}
                                  {Number(booking.status) === 1 && (
                                    <button disabled={updatingId === booking.booking_id} onClick={() => handleUpdateStatus(booking.booking_id, 2)}
                                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition shadow disabled:opacity-50">
                                      Check-in
                                    </button>
                                  )}
                                  {Number(booking.status) === 2 && (
                                    <button disabled={updatingId === booking.booking_id} onClick={() => handleUpdateStatus(booking.booking_id, 3)}
                                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition shadow disabled:opacity-50">
                                      Check-out
                                    </button>
                                  )}
                                  {Number(booking.status) === 0 && (
                                    <button disabled={updatingId === booking.booking_id} onClick={() => handleUpdateStatus(booking.booking_id, 3)}
                                      className="px-2 py-1 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 rounded-lg text-xs transition">
                                      Hủy
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredBookings.length === 0 && (
                          <tr><td colSpan={6} className="py-12 text-center text-slate-500">Không tìm thấy đơn đặt phòng nào phù hợp bộ lọc.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Phân trang booking */}
                  <Pagination currentPage={bookingPagination?.currentPage || 1} totalPages={bookingPagination?.totalPages || 1} onPageChange={setBookingPage} />
                </div>
              </motion.div>
            )}

            {/* TAB: QUẢN LÝ PHÒNG VÀ KHÁCH SẠN */}
            {activeTab === "rooms" && (
              <motion.div key="rooms" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Quản lý Phòng &amp; Khách sạn</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Cấu hình danh sách phòng trống và mức giá lưu trú</p>
                  </div>
                  <button className="px-4 py-2 bg-[#fbbf24] hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg">
                    + Thêm phòng mới
                  </button>
                </div>

                {/* Khách sạn Card (Click để chọn xem danh sách phòng) */}
                <div className="mb-4 text-xs font-semibold text-slate-400">💡 Nhấp vào một khách sạn dưới đây để xem và quản lý danh sách phòng tương ứng:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {myHotels.map((hotel) => {
                    const isSelected = (selectedHotelId || myHotels[0]?.hotel_id) === hotel.hotel_id;
                    return (
                      <div
                        key={hotel.hotel_id}
                        onClick={() => { setSelectedHotelId(hotel.hotel_id); setRoomPage(1); }}
                        className={`bg-[#131f37] rounded-2xl border overflow-hidden shadow-xl transition cursor-pointer group ${
                          isSelected ? "border-[#fbbf24] ring-2 ring-[#fbbf24]/60" : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="h-44 bg-slate-800 overflow-hidden relative">
                          <img
                            src={hotel.hotel_images?.[0]?.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            alt="hotel"
                          />
                          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">Đã hoạt động</span>
                          {isSelected && (
                            <span className="absolute top-3 left-3 bg-[#fbbf24] text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full shadow flex items-center gap-1">
                              ✓ Đang chọn
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg text-white mb-1 truncate">{hotel.hotel_name}</h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">📍 {hotel.city || "Hà Nội"}</p>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{hotel.description}</p>
                          <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm">
                            <span className="text-amber-400 font-bold">⭐ {hotel.star_rating} Sao</span>
                            <span className="text-slate-300 font-bold">{isSelected ? (roomPagination?.totalItems || myRooms.length) : "10"} Phòng</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Danh sách phòng */}
                <div className="bg-[#131f37] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span>Danh sách Phòng — <span className="text-[#fbbf24]">{myHotels.find((h: any) => h.hotel_id === (selectedHotelId || myHotels[0]?.hotel_id))?.hotel_name || "Khách sạn"}</span></span>
                    {roomPagination && <span className="text-sm text-slate-400 font-normal">({roomPagination.totalItems} phòng)</span>}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3.5 pr-4">Số phòng / Tên</th>
                          <th className="pb-3.5 px-4">Loại phòng</th>
                          <th className="pb-3.5 px-4">Giá 1 đêm</th>
                          <th className="pb-3.5 pl-4 text-right">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {myRooms.map((room) => (
                          <tr key={room.room_id} className="hover:bg-slate-800/40 transition">
                            <td className="py-4 pr-4 font-bold text-white">{room.room_number || `Phòng ${room.room_id}`}</td>
                            <td className="py-4 px-4 text-slate-400">
                              {room.room_types?.type_name || (room.room_type_id === 2 ? "VIP Suite" : "Standard")}
                            </td>
                            <td className="py-4 px-4 font-bold text-[#fbbf24]">{formatCurrencyVND(room.price_per_night)}</td>
                            <td className="py-4 pl-4 text-right">
                              {room.status === 0 ? (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">Phòng trống</span>
                              ) : (
                                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold">Đang phục vụ</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {myRooms.length === 0 && (
                          <tr><td colSpan={4} className="py-10 text-center text-slate-500">Chưa có phòng nào.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination currentPage={roomPagination?.currentPage || 1} totalPages={roomPagination?.totalPages || 1} onPageChange={setRoomPage} />
                </div>
              </motion.div>
            )}

            {/* TAB: DOANH THU với bộ lọc thời gian */}
            {activeTab === "revenue" && (
              <motion.div key="revenue" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Báo cáo Doanh thu</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Xem thống kê doanh thu theo kỳ</p>
                </div>
                {/* Bộ lọc */}
                <div className="bg-[#131f37] border border-slate-800/80 rounded-2xl p-5 mb-6 shadow-xl">
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="text-xs text-slate-400 font-semibold block mb-1.5 uppercase tracking-wider">Kỳ thống kê</label>
                      <div className="flex gap-1.5">
                        {[{id:"day",label:"Hôm nay"},{id:"week",label:"Tuần"},{id:"month",label:"Tháng"},{id:"year",label:"Năm"},{id:"custom",label:"Tùy chọn"}].map(opt => (
                          <button key={opt.id} onClick={() => setStatsPeriod(opt.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${statsPeriod === opt.id ? "bg-[#fbbf24] text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {statsPeriod === "custom" && (
                      <>
                        <div>
                          <label className="text-xs text-slate-400 font-semibold block mb-1.5">Từ ngày</label>
                          <input type="date" value={statsStartDate} onChange={e => setStatsStartDate(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white [color-scheme:dark]" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-semibold block mb-1.5">Đến ngày</label>
                          <input type="date" value={statsEndDate} onChange={e => setStatsEndDate(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white [color-scheme:dark]" />
                        </div>
                      </>
                    )}
                    <button onClick={handleFetchStats}
                      className="px-4 py-1.5 bg-[#fbbf24] hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition shadow">
                      Áp dụng
                    </button>
                  </div>
                </div>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                  {[
                    { label: "Tổng doanh thu", value: formatCurrencyVND(stats?.totalRevenue || 0), icon: "💰", color: "text-amber-400" },
                    { label: "Đặt phòng trong kỳ", value: `${stats?.newBookings || 0} lượt`, icon: "📅", color: "text-blue-400" },
                    { label: "Tổng số phòng", value: `${stats?.totalRooms || 0} phòng`, icon: "🏨", color: "text-emerald-400" },
                  ].map((card, i) => (
                    <div key={i} className="bg-[#131f37] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-400">{card.label}</span>
                        <span className="text-xl">{card.icon}</span>
                      </div>
                      <p className={`text-2xl font-extrabold ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>
                {/* Monthly Bar Chart */}
                {stats?.monthlyStats && stats.monthlyStats.length > 0 && (
                  <div className="bg-[#131f37] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6">Biểu đồ doanh thu theo tháng (triệu VND)</h3>
                    <div className="h-52 flex items-end gap-2 px-2">
                      {stats.monthlyStats.map((m: any, i: number) => {
                        const maxRev = Math.max(...stats.monthlyStats.map((x: any) => x.revenue), 1);
                        const heightPct = Math.round((m.revenue / maxRev) * 100);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="w-full relative" style={{ height: `${Math.max(heightPct, 3)}%` }}>
                              <div className="absolute inset-0 bg-gradient-to-t from-amber-500 to-[#fbbf24] rounded-t-md opacity-80 group-hover:opacity-100 transition" />
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 whitespace-nowrap">{m.revenue}M</span>
                            </div>
                            <span className="text-[10px] text-slate-500">{m.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: ĐÁNH GIÁ - DỮ LIỆU THẬT TỪ DB */}
            {activeTab === "reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Đánh giá khách hàng</h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {myHotels[0]?.hotel_name} • {reviewPagination?.totalItems || myReviews.length} đánh giá
                    </p>
                  </div>
                  <span className="bg-[#fbbf24] text-slate-950 font-bold px-3 py-1 rounded-full text-sm">
                    {reviewPagination?.totalItems || myReviews.length}
                  </span>
                </div>
                {myReviews.length === 0 ? (
                  <div className="bg-[#131f37] border border-dashed border-slate-700 rounded-2xl p-12 text-center">
                    <p className="text-slate-400">Đang tải đánh giá hoặc chưa có đánh giá nào.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myReviews.map((r: any, idx: number) => {
                      const guestName = r.users?.full_name || "Khách hàng";
                      const initials = guestName.split(" ").slice(-2).map((w: string) => w[0]?.toUpperCase() || "").join("");
                      const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : "";
                      return (
                        <div key={r.review_id || idx} className="bg-[#131f37] border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700 transition">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center text-[#fbbf24] font-bold text-xs shrink-0">
                              {initials || "KH"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-white text-sm">{guestName}</span>
                                <div className="flex items-center gap-0.5">
                                  {[1,2,3,4,5].map(s => <span key={s} className={s <= (r.rating||5) ? "text-[#fbbf24] text-sm" : "text-slate-700 text-sm"}>★</span>)}
                                </div>
                              </div>
                              {dateStr && <p className="text-[10px] text-slate-500 mb-2">{dateStr}</p>}
                              {r.comment && <p className="text-slate-300 text-sm italic">"{r.comment}"</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Pagination currentPage={reviewPagination?.currentPage || 1} totalPages={reviewPagination?.totalPages || 1} onPageChange={setReviewPage} />
              </motion.div>
            )}

            {/* TAB: CÀI ĐẶT */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <h2 className="text-2xl font-bold text-white mb-6">Cài đặt tài khoản</h2>
                <div className="bg-[#131f37] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                  <p className="text-slate-400 text-sm">Tính năng đang được phát triển. Liên hệ Admin để cập nhật thông tin tài khoản.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
