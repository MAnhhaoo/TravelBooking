"use client";

import { useEffect, useState } from "react";
import { getUsersAPI, getHotelsAPI, updateHotelStatusAPI, getAdminStatsAPI } from "../../../services/api";
import { mapUserRole, formatDate } from "../../../utils/dataMappers";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Settings profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: "Nguyễn Quản Trị",
    email: "admin@travelbooking.vn",
    phone: "0912 345 678",
    address: "123 Nguyễn Huệ, Quận 1, TP. HCM",
    bio: "Quản trị viên hệ thống TravelBooking."
  });

  // Settings notifications toggle state
  const [notifSettings, setNotifSettings] = useState({
    emailAlerts: true,
    bookingAlerts: true,
    systemReports: false,
    marketing: false
  });

  useEffect(() => {
    const handleTabChange = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener("admin-tab-change", handleTabChange);

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      if (tab) setActiveTab(tab);
    }

    return () => window.removeEventListener("admin-tab-change", handleTabChange);
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [usersData, hotelsData, statsData] = await Promise.all([
          getUsersAPI(),
          getHotelsAPI(),
          getAdminStatsAPI()
        ]);
        setUsers(usersData || []);
        setHotels(hotelsData || []);
        setStats(statsData);
      } catch (error) {
        console.error("Lỗi fetch dữ liệu Admin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleUpdateHotelStatus = async (hotelId: string, status: number) => {
    try {
      await updateHotelStatusAPI(hotelId, status);
      setHotels(hotels.map(h => h.hotel_id === hotelId ? { ...h, status } : h));
      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái!");
      console.error(error);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✅ Đã lưu thay đổi cài đặt hồ sơ thành công!");
  };

  const formatMoneyM = (val: number) => {
    if (!val) return "0M đ";
    return Math.round(val / 1000000) + "M đ";
  };

  const summary = stats?.summary || {
    totalRevenue: 2435000000,
    totalBookings: 841,
    totalHotels: 48,
    totalUsers: 3284,
    revenueGrowth: "+18.4%",
    bookingsGrowth: "+12.7%",
    hotelsGrowth: "+4%",
    usersGrowth: "-2.1%"
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // RENDER MONTHLY AREA CHART
  const renderMonthlyChart = () => {
    const months = stats?.monthlyStats || [];
    if (months.length === 0) return null;

    const revPoints = months.map((m: any, i: number) => {
      const x = 30 + i * 49;
      const y = 170 - (Math.min(m.revenue, 350) / 350) * 140;
      return `${x},${y}`;
    }).join(" ");

    const bookPoints = months.map((m: any, i: number) => {
      const x = 30 + i * 49;
      const y = 170 - (Math.min(m.bookings, 120) / 120) * 140;
      return `${x},${y}`;
    }).join(" ");

    const revArea = `30,170 ${revPoints} 569,170`;

    return (
      <div className="relative w-full pt-4 pb-2">
        <svg viewBox="0 0 600 200" className="w-full h-64 overflow-visible">
          <defs>
            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#facc15" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#facc15" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="bookGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 75, 150, 225, 300].map((val, idx) => {
            const y = 170 - (val / 350) * 140;
            return (
              <g key={idx}>
                <line x1="30" y1={y} x2="570" y2={y} stroke="#1e293b" strokeDasharray="4 4" />
                <text x="5" y={y + 4} fill="#64748b" fontSize="11" fontWeight="bold">{val}</text>
              </g>
            );
          })}

          <polygon points={revArea} fill="url(#revGradient)" />
          <polyline fill="none" stroke="#facc15" strokeWidth="3" points={revPoints} />
          <polyline fill="none" stroke="#8b5cf6" strokeWidth="3" points={bookPoints} />

          {months.map((m: any, i: number) => {
            const x = 30 + i * 49;
            const yRev = 170 - (Math.min(m.revenue, 350) / 350) * 140;
            const yBook = 170 - (Math.min(m.bookings, 120) / 120) * 140;
            return (
              <g key={i} className="group cursor-pointer">
                <circle cx={x} cy={yRev} r="4" fill="#facc15" className="transition-all group-hover:r-6" />
                <circle cx={x} cy={yBook} r="4" fill="#8b5cf6" className="transition-all group-hover:r-6" />
                <text x={x} y="195" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">{m.month}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // RENDER DONUT CHART
  const renderDonutChart = () => {
    const st = stats?.statusStats || {
      confirmed: { percent: 58 },
      pending: { percent: 24 },
      cancelled: { percent: 11 },
      completed: { percent: 7 }
    };

    const c = st.confirmed?.percent || 58;
    const p = st.pending?.percent || 24;
    const cx = st.cancelled?.percent || 11;
    const cp = st.completed?.percent || 7;

    const radius = 65;
    const circ = 2 * Math.PI * radius;

    const cLen = (c / 100) * circ;
    const pLen = (p / 100) * circ;
    const cxLen = (cx / 100) * circ;
    const cpLen = (cp / 100) * circ;
    const gap = 6;

    return (
      <div className="flex flex-col items-center justify-between h-full py-2">
        <div className="relative w-48 h-48 flex items-center justify-center my-auto">
          <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="#1e293b" strokeWidth="22" />
            <circle cx="80" cy="80" r={radius} fill="none" stroke="#10b981" strokeWidth="22"
              strokeDasharray={`${Math.max(0, cLen - gap)} ${circ}`} strokeDashoffset="0" strokeLinecap="round" />
            <circle cx="80" cy="80" r={radius} fill="none" stroke="#facc15" strokeWidth="22"
              strokeDasharray={`${Math.max(0, pLen - gap)} ${circ}`} strokeDashoffset={-cLen} strokeLinecap="round" />
            <circle cx="80" cy="80" r={radius} fill="none" stroke="#ef4444" strokeWidth="22"
              strokeDasharray={`${Math.max(0, cxLen - gap)} ${circ}`} strokeDashoffset={-(cLen + pLen)} strokeLinecap="round" />
            <circle cx="80" cy="80" r={radius} fill="none" stroke="#6366f1" strokeWidth="22"
              strokeDasharray={`${Math.max(0, cpLen - gap)} ${circ}`} strokeDashoffset={-(cLen + pLen + cxLen)} strokeLinecap="round" />
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full text-xs mt-6 pt-4 border-t border-blue-900/30">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 font-medium"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Đã xác nhận</span>
            <span className="font-bold text-white text-sm">{c}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 font-medium"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Chờ duyệt</span>
            <span className="font-bold text-white text-sm">{p}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 font-medium"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Đã hủy</span>
            <span className="font-bold text-white text-sm">{cx}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 font-medium"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Hoàn thành</span>
            <span className="font-bold text-white text-sm">{cp}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* ===================== TAB: OVERVIEW (MAIN DASHBOARD) ===================== */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Tổng quan hệ thống</h1>
            <p className="text-xs text-slate-400 mt-1">Dữ liệu cập nhật đến 28/06/2026</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#111c38] p-6 rounded-2xl border border-blue-900/40 shadow-xl relative overflow-hidden group hover:border-yellow-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">DOANH THU</span>
                <div className="w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold text-lg border border-yellow-500/20">$</div>
              </div>
              <h3 className="text-3xl font-extrabold text-white mt-4">{formatMoneyM(summary.totalRevenue)}</h3>
              <div className="flex items-center justify-between mt-4 text-xs">
                <span className="text-slate-400">Cả năm 2026</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">↗ {summary.revenueGrowth}</span>
              </div>
            </div>

            <div className="bg-[#111c38] p-6 rounded-2xl border border-blue-900/40 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">ĐẶT PHÒNG</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-white mt-4">{summary.totalBookings?.toLocaleString()}</h3>
              <div className="flex items-center justify-between mt-4 text-xs">
                <span className="text-slate-400">Tổng lượt</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">↗ {summary.bookingsGrowth}</span>
              </div>
            </div>

            <div className="bg-[#111c38] p-6 rounded-2xl border border-blue-900/40 shadow-xl relative overflow-hidden group hover:border-teal-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">KHÁCH SẠN</span>
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-white mt-4">{summary.totalHotels}</h3>
              <div className="flex items-center justify-between mt-4 text-xs">
                <span className="text-slate-400">Đang hoạt động</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">↗ {summary.hotelsGrowth}</span>
              </div>
            </div>

            <div className="bg-[#111c38] p-6 rounded-2xl border border-blue-900/40 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">KHÁCH HÀNG</span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-white mt-4">{summary.totalUsers?.toLocaleString()}</h3>
              <div className="flex items-center justify-between mt-4 text-xs">
                <span className="text-slate-400">Tài khoản đã đăng ký</span>
                <span className="text-rose-400 font-bold flex items-center gap-1">↘ {summary.usersGrowth}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#111c38] p-6 rounded-2xl border border-blue-900/40 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg font-bold text-white">Doanh thu & Đặt phòng</h2>
                  <p className="text-xs text-slate-400">Theo tháng — 2026</p>
                </div>
                <div className="flex items-center gap-6 text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Doanh thu</span>
                  <span className="flex items-center gap-2 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Đặt phòng</span>
                </div>
              </div>
              {renderMonthlyChart()}
            </div>

            <div className="bg-[#111c38] p-6 rounded-2xl border border-blue-900/40 shadow-xl flex flex-col">
              <div>
                <h2 className="text-lg font-bold text-white">Trạng thái đặt phòng</h2>
                <p className="text-xs text-slate-400">Tháng 6/2026</p>
              </div>
              <div className="flex-1 mt-4">
                {renderDonutChart()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#111c38] p-6 rounded-2xl border border-blue-900/40 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Khách sạn nổi bật</h2>
                  <p className="text-xs text-slate-400">Top theo doanh thu</p>
                </div>
                <button onClick={() => window.dispatchEvent(new CustomEvent("admin-tab-change", { detail: "hotels" }))} className="text-xs font-bold text-yellow-400 hover:underline">
                  Xem tất cả &gt;
                </button>
              </div>

              <div className="space-y-4">
                {(stats?.topHotels || []).map((h: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`font-bold text-sm w-4 shrink-0 ${idx < 3 ? "text-yellow-400" : "text-slate-500"}`}>{idx + 1}</span>
                      <img src={h.image} alt="" className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-700 shadow" />
                      <div className="min-w-0 truncate">
                        <p className="font-bold text-white text-sm truncate">{h.name}</p>
                        <p className="text-xs text-slate-400 truncate">📍 {h.city} ★ {h.rating}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-bold text-white text-sm">{formatMoneyM(h.revenue)}</p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <span className="text-[11px] text-slate-400">{h.bookingsCount} đặt</span>
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${h.occupancyRate || 80}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111c38] p-6 rounded-2xl border border-blue-900/40 shadow-xl flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Tỷ lệ lấp đầy tuần này</h2>
                <p className="text-xs text-slate-400">Tuần 26 — 2026</p>
              </div>

              <div className="flex items-end justify-between h-48 pt-6 px-2">
                {(stats?.weeklyOccupancy || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] text-yellow-400 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{item.rate}%</span>
                    <div className="w-7 bg-slate-800 rounded-t-lg h-36 flex items-end overflow-hidden">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 ${idx >= 4 ? "bg-gradient-to-t from-yellow-500 to-yellow-300" : "bg-gradient-to-t from-yellow-700/80 to-yellow-500/80"}`} 
                        style={{ height: `${item.rate}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-400 font-bold mt-2">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111c38] p-6 rounded-2xl border border-blue-900/40 shadow-xl flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Hoạt động gần đây</h2>
              </div>

              <div className="space-y-4 my-2">
                {(stats?.recentActivities || []).map((act: any, idx: number) => {
                  const icons: any = {
                    confirmed: { bg: "bg-emerald-500/10", color: "text-emerald-400", icon: "✓" },
                    pending: { bg: "bg-yellow-500/10", color: "text-yellow-400", icon: "⏱" },
                    cancelled: { bg: "bg-rose-500/10", color: "text-rose-400", icon: "✕" },
                    user: { bg: "bg-purple-500/10", color: "text-purple-400", icon: "👤" },
                    payment: { bg: "bg-blue-500/10", color: "text-blue-400", icon: "$" }
                  };
                  const ic = icons[act.type] || icons.confirmed;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-1.5 rounded-xl hover:bg-white/5 transition-all">
                      <div className={`w-8 h-8 rounded-full ${ic.bg} ${ic.color} flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 border border-white/5`}>
                        {ic.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-200 leading-snug">{act.text}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{act.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: HOTELS MANAGEMENT ===================== */}
      {activeTab === "hotels" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111c38] rounded-2xl border border-blue-900/40 shadow-xl p-6">
          <div className="flex justify-between items-center mb-6 border-b border-blue-900/30 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">🏢 Duyệt Khách Sạn</h2>
              <p className="text-xs text-slate-400 mt-1">Danh sách tất cả các khách sạn trên hệ thống ({hotels.length})</p>
            </div>
            <button onClick={() => window.dispatchEvent(new CustomEvent("admin-tab-change", { detail: "overview" }))} className="px-4 py-2 bg-[#18284c] hover:bg-blue-900/50 text-yellow-400 rounded-xl text-xs font-bold border border-yellow-500/30 transition-all">
              ← Quay lại Dashboard
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0a1128] text-slate-400 text-xs uppercase tracking-wider border-b border-blue-900/30">
                <tr>
                  <th className="p-4 rounded-tl-xl">Khách sạn</th>
                  <th className="p-4">Vị trí</th>
                  <th className="p-4">Chủ sở hữu</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 rounded-tr-xl">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20 text-sm">
                {hotels.map((hotel) => (
                  <tr key={hotel.hotel_id} className="hover:bg-white/5 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={hotel.hotel_images?.[0]?.image_url || "/placeholder.jpg"} className="w-12 h-12 rounded-xl object-cover border border-slate-700" alt="" />
                        <div>
                          <p className="font-bold text-white">{hotel.hotel_name}</p>
                          <p className="text-xs text-yellow-400">{"★".repeat(hotel.star_rating || 5)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{hotel.city}</td>
                    <td className="p-4 text-slate-400">User #{hotel.owner_id}</td>
                    <td className="p-4">
                      {hotel.status === 1 ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">Hoạt động</span>
                      ) : (
                        <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold">Chờ duyệt</span>
                      )}
                    </td>
                    <td className="p-4">
                      {hotel.status === 0 ? (
                        <button 
                          onClick={() => handleUpdateHotelStatus(hotel.hotel_id, 1)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow"
                        >
                          Phê duyệt
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateHotelStatus(hotel.hotel_id, 0)}
                          className="bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow"
                        >
                          Tạm ngưng
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: USERS MANAGEMENT ===================== */}
      {activeTab === "users" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111c38] rounded-2xl border border-blue-900/40 shadow-xl p-6">
          <div className="flex justify-between items-center mb-6 border-b border-blue-900/30 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">👤 Quản lý Người dùng</h2>
              <p className="text-xs text-slate-400 mt-1">Danh sách tất cả tài khoản trong hệ thống ({users.length})</p>
            </div>
            <button onClick={() => window.dispatchEvent(new CustomEvent("admin-tab-change", { detail: "overview" }))} className="px-4 py-2 bg-[#18284c] hover:bg-blue-900/50 text-yellow-400 rounded-xl text-xs font-bold border border-yellow-500/30 transition-all">
              ← Quay lại Dashboard
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0a1128] text-slate-400 text-xs uppercase tracking-wider border-b border-blue-900/30">
                <tr>
                  <th className="p-4 rounded-tl-xl">ID</th>
                  <th className="p-4">Họ và tên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4 rounded-tr-xl">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20 text-sm">
                {users.map((user) => {
                  const roleData = mapUserRole(user.role || 0);
                  return (
                    <tr key={user.id || user.user_id} className="hover:bg-white/5 transition">
                      <td className="p-4 text-slate-500 font-bold">#{user.id || user.user_id}</td>
                      <td className="p-4 font-bold text-white">{user.fullName || user.full_name}</td>
                      <td className="p-4 text-slate-300">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.role === 2 ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : user.role === 1 ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}>
                          {roleData?.text || (user.role === 2 ? "Admin" : user.role === 1 ? "Owner" : "Customer")}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{formatDate(user.createdAt || user.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: BOOKINGS MANAGEMENT ===================== */}
      {activeTab === "bookings" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111c38] rounded-2xl border border-blue-900/40 shadow-xl p-6">
          <div className="flex justify-between items-center mb-6 border-b border-blue-900/30 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">📅 Quản lý Đặt phòng</h2>
              <p className="text-xs text-slate-400 mt-1">Danh sách đặt phòng gần đây trên toàn hệ thống</p>
            </div>
            <button onClick={() => window.dispatchEvent(new CustomEvent("admin-tab-change", { detail: "overview" }))} className="px-4 py-2 bg-[#18284c] hover:bg-blue-900/50 text-yellow-400 rounded-xl text-xs font-bold border border-yellow-500/30 transition-all">
              ← Quay lại Dashboard
            </button>
          </div>

          <div className="p-8 text-center text-slate-400">
            <p className="text-lg font-bold text-white mb-2">Đang hiển thị 841 lượt đặt phòng</p>
            <p className="text-sm">Vui lòng chuyển qua tab Tổng quan để xem biểu đồ và phân tích chi tiết doanh thu đặt phòng.</p>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: SETTINGS (HỒ SƠ / PROFILE) ===================== */}
      {(activeTab === "settings" || activeTab === "settings-profile") && (
        <motion.form onSubmit={handleSaveProfile} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl pb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-[#facc15] flex items-center justify-center border border-yellow-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Hồ sơ</h1>
          </div>

          {/* Profile Banner Card */}
          <div className="bg-[#111c38] border border-blue-900/40 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-[#facc15] rounded-2xl flex items-center justify-center font-extrabold text-3xl text-slate-950 relative shadow-lg shrink-0">
                NQ
                <label className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#facc15] text-slate-950 flex items-center justify-center border-2 border-[#111c38] shadow hover:scale-110 transition cursor-pointer" title="Thay đổi ảnh">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" className="hidden" accept="image/*" onChange={() => alert("Đã chọn ảnh đại diện mới!")} />
                </label>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profileForm.fullName}</h2>
                <p className="text-xs text-slate-400 mt-1">Quản trị viên · TravelBooking</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button type="button" onClick={() => alert("Chức năng đổi ảnh đại diện")} className="px-4 py-2 bg-[#18284c] hover:bg-blue-900/60 text-[#facc15] font-bold text-xs rounded-xl border border-yellow-500/30 transition shadow">
                Đổi ảnh đại diện
              </button>
              <button type="button" onClick={() => alert("Đã xóa ảnh đại diện")} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs rounded-xl transition">
                Xóa ảnh
              </button>
            </div>
          </div>

          {/* Personal Info Form Card */}
          <div className="bg-[#111c38] border border-blue-900/40 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white">Thông tin cá nhân</h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">Cập nhật thông tin tài khoản của bạn</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Họ và tên */}
              <div>
                <label className="block text-xs text-slate-400 mb-2 flex items-center gap-1.5 font-medium">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Họ và tên</span>
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full bg-[#162447] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition shadow-inner"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs text-slate-400 mb-2 flex items-center gap-1.5 font-medium">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-[#162447] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition shadow-inner"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-xs text-slate-400 mb-2 flex items-center gap-1.5 font-medium">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Số điện thoại</span>
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-[#162447] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition shadow-inner"
                />
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-xs text-slate-400 mb-2 flex items-center gap-1.5 font-medium">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Địa chỉ</span>
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full bg-[#162447] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition shadow-inner"
                />
              </div>

              {/* Giới thiệu */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs text-slate-400 mb-2 font-medium">Giới thiệu</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-[#162447] border border-blue-900/50 rounded-xl p-4 text-sm text-white resize-none focus:outline-none focus:border-yellow-500 transition shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-yellow-500/20 flex items-center gap-2 cursor-pointer transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </motion.form>
      )}

      {/* ===================== TAB: SETTINGS (BẢO MẬT / SECURITY) ===================== */}
      {activeTab === "settings-security" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl pb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-[#facc15] flex items-center justify-center border border-yellow-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Bảo mật tài khoản</h1>
          </div>

          <div className="bg-[#111c38] border border-blue-900/40 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-blue-900/30 pb-4">Đổi mật khẩu</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Mật khẩu hiện tại</label>
                <input type="password" placeholder="••••••••" className="w-full bg-[#162447] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Mật khẩu mới</label>
                <input type="password" placeholder="••••••••" className="w-full bg-[#162447] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Xác nhận mật khẩu mới</label>
                <input type="password" placeholder="••••••••" className="w-full bg-[#162447] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500" />
              </div>
              <button onClick={() => alert("✅ Cập nhật mật khẩu thành công!")} className="bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-yellow-500/20 text-sm">
                Cập nhật mật khẩu
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: SETTINGS (THÔNG BÁO / NOTIFICATIONS) ===================== */}
      {activeTab === "settings-notifications" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl pb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-[#facc15] flex items-center justify-center border border-yellow-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Cấu hình thông báo</h1>
          </div>

          <div className="bg-[#111c38] border border-blue-900/40 rounded-2xl p-6 shadow-xl divide-y divide-blue-900/30">
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">Cảnh báo đặt phòng mới</p>
                <p className="text-xs text-slate-400 mt-0.5">Nhận email ngay khi có khách hàng đặt phòng hoặc hủy phòng</p>
              </div>
              <input type="checkbox" checked={notifSettings.bookingAlerts} onChange={(e) => setNotifSettings({ ...notifSettings, bookingAlerts: e.target.checked })} className="w-5 h-5 accent-yellow-400 rounded cursor-pointer" />
            </div>
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">Báo cáo tổng kết tuần / tháng</p>
                <p className="text-xs text-slate-400 mt-0.5">Tự động gửi báo cáo doanh thu vào sáng thứ Hai hàng tuần</p>
              </div>
              <input type="checkbox" checked={notifSettings.systemReports} onChange={(e) => setNotifSettings({ ...notifSettings, systemReports: e.target.checked })} className="w-5 h-5 accent-yellow-400 rounded cursor-pointer" />
            </div>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: SETTINGS (GIAO DIỆN / APPEARANCE) ===================== */}
      {activeTab === "settings-appearance" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl pb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-[#facc15] flex items-center justify-center border border-yellow-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 73h6a2 2 0 012 2v2a2 2 0 01-2 2h-6a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Tuỳ chỉnh giao diện</h1>
          </div>

          <div className="bg-[#111c38] border border-blue-900/40 rounded-2xl p-6 shadow-xl">
            <p className="text-sm font-bold text-white mb-4">Chế độ hiển thị</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="border-2 border-yellow-500 bg-[#0a1128] p-4 rounded-xl cursor-pointer text-center">
                <div className="h-16 bg-[#111c38] rounded-lg mb-2 flex items-center justify-center font-bold text-yellow-400">🌙 Dark Navy</div>
                <p className="text-xs font-bold text-white">Tối thượng hạng (Đang dùng)</p>
              </div>
              <div onClick={() => alert("Chế độ sáng hiện đang được khóa ở phiên bản Admin này")} className="border border-blue-900/40 bg-[#0a1128]/50 p-4 rounded-xl cursor-pointer text-center opacity-50 hover:opacity-80">
                <div className="h-16 bg-slate-200 rounded-lg mb-2 flex items-center justify-center font-bold text-slate-800">☀️ Light Mode</div>
                <p className="text-xs font-bold text-slate-400">Sáng tiêu chuẩn</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: SETTINGS (DOANH NGHIỆP / COMPANY) ===================== */}
      {activeTab === "settings-company" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl pb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-[#facc15] flex items-center justify-center border border-yellow-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Thông tin doanh nghiệp</h1>
          </div>

          <div className="bg-[#111c38] border border-blue-900/40 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tên công ty / nền tảng</label>
              <input type="text" readOnly value="Công ty Cổ phần Du lịch Trực tuyến TravelBooking" className="w-full bg-[#162447] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-slate-300" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Mã số thuế</label>
              <input type="text" readOnly value="0312345678" className="w-full bg-[#162447] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-slate-300" />
            </div>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: SETTINGS (TÍCH HỢP / INTEGRATIONS) ===================== */}
      {activeTab === "settings-integrations" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl pb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-[#facc15] flex items-center justify-center border border-yellow-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Tích hợp cổng thanh toán & API</h1>
          </div>

          <div className="bg-[#111c38] border border-blue-900/40 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#162447] rounded-xl border border-blue-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center">VN</div>
                <div>
                  <p className="font-bold text-white">Cổng thanh toán VNPay</p>
                  <p className="text-xs text-emerald-400">● Đang kết nối ổn định</p>
                </div>
              </div>
              <button onClick={() => alert("Đã kiểm tra kết nối VNPay thành công")} className="px-3 py-1.5 bg-blue-600/30 text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-600/50">Cấu hình</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===================== TAB: SETTINGS (NGUY HIỂM / DANGER) ===================== */}
      {activeTab === "settings-danger" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl pb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-rose-400">Vùng nguy hiểm</h1>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Xóa bộ nhớ đệm (Cache) toàn hệ thống</p>
                <p className="text-xs text-slate-400 mt-0.5">Làm mới toàn bộ cache của khách sạn và hình ảnh</p>
              </div>
              <button onClick={() => alert("🗑 Đã dọn dẹp sạch cache hệ thống!")} className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs">Xóa Cache</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}