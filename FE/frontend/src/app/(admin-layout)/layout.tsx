"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

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

  const selectTab = (tabId: string) => {
    setActiveTab(tabId);
    window.dispatchEvent(new CustomEvent("admin-tab-change", { detail: tabId }));
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleLogout = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const isSettings = activeTab.startsWith("settings");

  return (
    <div className="min-h-screen bg-[#060d1f] text-slate-100 font-sans selection:bg-yellow-500 selection:text-slate-900 flex flex-col">
      {/* ==================== SETTINGS TOPBAR ==================== */}
      {isSettings ? (
        <header className="h-20 border-b border-blue-900/30 bg-[#0a1128] px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-8">
            <h1 onClick={() => selectTab("overview")} className="text-2xl font-serif font-extrabold text-[#facc15] tracking-wide cursor-pointer">
              TravelBooking
            </h1>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span onClick={() => selectTab("overview")} className="text-slate-400 hover:text-white cursor-pointer transition">
                Admin
              </span>
              <span className="text-slate-600">&gt;</span>
              <span className="text-white font-bold">Cài đặt</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#facc15] text-slate-950 font-extrabold flex items-center justify-center text-lg shadow-md cursor-pointer">
              A
            </div>
          </div>
        </header>
      ) : null}

      <div className="flex flex-1 min-h-0">
        {/* ==================== LEFT SIDEBAR ==================== */}
        {isSettings ? (
          /* SETTINGS SIDEBAR */
          <aside className="w-64 bg-[#0a1128] border-r border-blue-900/30 p-6 flex flex-col justify-between shrink-0 sticky top-20 h-[calc(100vh-5rem)]">
            <div className="space-y-6">
              <div className="px-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">CÀI ĐẶT</p>
              </div>

              <nav className="space-y-1.5">
                {/* Hồ sơ */}
                <button
                  onClick={() => selectTab("settings-profile")}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 ${
                    activeTab === "settings-profile" || activeTab === "settings"
                      ? "bg-[#18284c] text-[#facc15] border border-yellow-500/30 shadow-lg shadow-blue-950/50"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Hồ sơ</span>
                  </div>
                  {(activeTab === "settings-profile" || activeTab === "settings") && (
                    <span className="w-2 h-2 rounded-full bg-[#facc15]"></span>
                  )}
                </button>

                {/* Bảo mật */}
                <button
                  onClick={() => selectTab("settings-security")}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 ${
                    activeTab === "settings-security"
                      ? "bg-[#18284c] text-[#facc15] border border-yellow-500/30 shadow-lg"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Bảo mật</span>
                  </div>
                  {activeTab === "settings-security" && <span className="w-2 h-2 rounded-full bg-[#facc15]"></span>}
                </button>

                {/* Thông báo */}
                <button
                  onClick={() => selectTab("settings-notifications")}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 ${
                    activeTab === "settings-notifications"
                      ? "bg-[#18284c] text-[#facc15] border border-yellow-500/30 shadow-lg"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span>Thông báo</span>
                  </div>
                  {activeTab === "settings-notifications" && <span className="w-2 h-2 rounded-full bg-[#facc15]"></span>}
                </button>

                {/* Giao diện */}
                <button
                  onClick={() => selectTab("settings-appearance")}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 ${
                    activeTab === "settings-appearance"
                      ? "bg-[#18284c] text-[#facc15] border border-yellow-500/30 shadow-lg"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 73h6a2 2 0 012 2v2a2 2 0 01-2 2h-6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                    </svg>
                    <span>Giao diện</span>
                  </div>
                  {activeTab === "settings-appearance" && <span className="w-2 h-2 rounded-full bg-[#facc15]"></span>}
                </button>

                {/* Doanh nghiệp */}
                <button
                  onClick={() => selectTab("settings-company")}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 ${
                    activeTab === "settings-company"
                      ? "bg-[#18284c] text-[#facc15] border border-yellow-500/30 shadow-lg"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Doanh nghiệp</span>
                  </div>
                  {activeTab === "settings-company" && <span className="w-2 h-2 rounded-full bg-[#facc15]"></span>}
                </button>

                {/* Tích hợp */}
                <button
                  onClick={() => selectTab("settings-integrations")}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 ${
                    activeTab === "settings-integrations"
                      ? "bg-[#18284c] text-[#facc15] border border-yellow-500/30 shadow-lg"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span>Tích hợp</span>
                  </div>
                  {activeTab === "settings-integrations" && <span className="w-2 h-2 rounded-full bg-[#facc15]"></span>}
                </button>

                {/* Nguy hiểm */}
                <button
                  onClick={() => selectTab("settings-danger")}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 ${
                    activeTab === "settings-danger"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg"
                      : "text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Nguy hiểm</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Back to Dashboard */}
            <div className="pt-4 border-t border-blue-900/20">
              <button
                onClick={() => selectTab("overview")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white font-bold text-sm transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Quay lại Dashboard</span>
              </button>
            </div>
          </aside>
        ) : (
          /* MAIN DASHBOARD SIDEBAR */
          <aside className="w-64 bg-[#0a1128] border-r border-blue-900/30 flex flex-col justify-between shrink-0 sticky top-0 h-screen z-20">
            <div>
              {/* Logo */}
              <div className="px-6 py-6 border-b border-blue-900/20">
                <h1 onClick={() => selectTab("overview")} className="text-2xl font-serif font-extrabold text-[#facc15] tracking-wide cursor-pointer">
                  TravelBooking
                </h1>
              </div>

              {/* User Profile Card */}
              <div className="mx-4 my-6 p-3 rounded-xl bg-[#121e3a] border border-blue-500/20 flex items-center gap-3 shadow-inner">
                <div className="w-10 h-10 rounded-full bg-[#facc15] text-slate-950 font-extrabold flex items-center justify-center text-lg shadow-md shrink-0">
                  A
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-bold text-white text-sm leading-tight truncate">Admin</h2>
                  <p className="text-xs text-slate-400 truncate">Quản trị viên</p>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="px-6 mb-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">MENU CHÍNH</p>
              </div>

              <nav className="space-y-1.5 px-3">
                {/* Tổng quan */}
                <button
                  onClick={() => selectTab("overview")}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 ${
                    activeTab === "overview"
                      ? "bg-[#18284c] text-[#facc15] border border-yellow-500/30 shadow-lg shadow-blue-950/50"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Tổng quan</span>
                  </div>
                </button>

                {/* Đặt phòng */}
                <button
                  onClick={() => selectTab("bookings")}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 ${
                    activeTab === "bookings"
                      ? "bg-[#18284c] text-[#facc15] border border-yellow-500/30 shadow-lg shadow-blue-950/50"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Đặt phòng</span>
                  </div>
                  <span className="bg-[#facc15] text-slate-950 font-extrabold text-xs px-2 py-0.5 rounded-full">24</span>
                </button>

                {/* Khách sạn */}
                <button
                  onClick={() => selectTab("hotels")}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 ${
                    activeTab === "hotels"
                      ? "bg-[#18284c] text-[#facc15] border border-yellow-500/30 shadow-lg shadow-blue-950/50"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Khách sạn</span>
                  </div>
                </button>

                {/* Khách hàng */}
                <button
                  onClick={() => selectTab("users")}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 ${
                    activeTab === "users"
                      ? "bg-[#18284c] text-[#facc15] border border-yellow-500/30 shadow-lg shadow-blue-950/50"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Khách hàng</span>
                  </div>
                </button>

                {/* Quản lý Voucher */}
                <button
                  onClick={() => selectTab("vouchers")}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 ${
                    activeTab === "vouchers"
                      ? "bg-[#18284c] text-[#facc15] border border-yellow-500/30 shadow-lg shadow-blue-950/50"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🎟️</span>
                    <span>Quản lý Voucher</span>
                  </div>
                </button>

                {/* Cài đặt */}
                <button
                  onClick={() => selectTab("settings-profile")}
                  className="w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-200 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Cài đặt</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Footer Logout */}
            <div className="p-4 border-t border-blue-900/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold text-sm transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Đăng xuất</span>
              </button>
            </div>
          </aside>
        )}

        {/* ==================== MAIN CONTENT AREA ==================== */}
        <main className="flex-1 min-w-0 flex flex-col h-[calc(100vh-5rem)] overflow-y-auto">
          {/* TOP BAR (ONLY FOR MAIN DASHBOARD) */}
          {!isSettings ? (
            <header className="h-20 border-b border-blue-900/30 bg-[#0a1128]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
              <div className="text-white font-bold text-lg font-serif tracking-wide flex items-center gap-2">
                <span className="text-yellow-400">🛡️</span> Hệ Thống Quản Trị Viên (Admin Portal)
              </div>

              <div className="flex items-center gap-6">
                <span className="text-slate-300 text-sm font-medium">
                  Thứ Hai, 29 tháng 6, 2026
                </span>
                <button className="w-10 h-10 rounded-xl bg-[#111e38] border border-blue-900/50 flex items-center justify-center text-slate-300 hover:text-yellow-400 hover:border-yellow-500/30 transition-all relative">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                </button>
              </div>
            </header>
          ) : null}

          {/* PAGE CONTENT */}
          <div className="flex-1 p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}