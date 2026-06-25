"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout } from "../../redux/slices/authSlice";

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authUser = useSelector((state: any) => state.auth?.user);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({ fullName: "", phone: "" });

  useEffect(() => {
    // Khôi phục phiên đăng nhập từ storage khi reload trang
    if (typeof window !== "undefined" && !authUser) {
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (storedUser && storedToken) {
        try {
          const userObj = JSON.parse(storedUser);
          dispatch(loginSuccess({ user: userObj, token: storedToken }));
          setProfileData({ fullName: userObj.full_name || userObj.fullName || "", phone: userObj.phone || "" });
        } catch (e) {
          console.error("Lỗi parse user storage:", e);
        }
      }
    } else if (authUser) {
      setProfileData({ fullName: authUser.full_name || authUser.fullName || "", phone: authUser.phone || "" });
    }
  }, [authUser, dispatch]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    }
    dispatch(logout());
    setIsDropdownOpen(false);
    router.push("/");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...authUser, full_name: profileData.fullName, fullName: profileData.fullName, phone: profileData.phone };
    if (typeof window !== "undefined") {
      if (localStorage.getItem("user")) localStorage.setItem("user", JSON.stringify(updatedUser));
      if (sessionStorage.getItem("user")) sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
    dispatch(loginSuccess({ user: updatedUser, token: localStorage.getItem("token") || "mock-token" }));
    alert("Cập nhật thông tin cá nhân thành công!");
    setIsProfileModalOpen(false);
  };

  const displayName = authUser?.full_name || authUser?.fullName || authUser?.email?.split("@")[0] || "Thành viên";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";

  return (
    <>
      <header className="bg-[#070c1e]/80 backdrop-blur-md border-b border-slate-900 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-wide font-serif cursor-pointer">
            <span className="text-white">Travel</span>
            <span className="text-[#e5c158]">Booking</span>
          </Link>

          {/* Menu Điều Hướng */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-[#e5c158] transition">
              Trang chủ
            </Link>
            <Link href="/hotels" className="hover:text-[#e5c158] transition">
              Khách sạn
            </Link>
            <Link href="/offers" className="hover:text-[#e5c158] transition">
              Ưu đãi
            </Link>
            <Link href="/blog" className="hover:text-[#e5c158] transition">
              Blog
            </Link>
            <Link href="/contact" className="hover:text-[#e5c158] transition">
              Liên hệ
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-6 relative">
            <div className="flex items-center gap-2 text-sm cursor-pointer text-slate-300 hover:text-white">
              <span>🇻🇳</span>
              <span>VND</span>
            </div>

            {/* ĐỒNG BỘ HEADER KHI ĐĂNG NHẬP */}
            {!authUser ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-[#e5c158] transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="bg-[#e5c158] hover:bg-[#d4af37] text-black px-5 py-2 rounded-full text-sm font-bold transition shadow-lg shadow-yellow-500/5"
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="relative">
                {/* Avatar Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-full bg-[#0f1736] border border-slate-700/60 hover:border-[#e5c158] transition group focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#e5c158] to-[#d4af37] text-black font-extrabold flex items-center justify-center text-sm shadow-md">
                    {avatarLetter}
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold text-slate-200 group-hover:text-[#e5c158] max-w-[120px] truncate pr-2">
                    {displayName}
                  </span>
                  <span className="text-xs text-slate-400 pr-1">▼</span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-[#0d1430]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 text-white animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Tài khoản</p>
                      <p className="text-sm font-bold text-[#e5c158] truncate">{authUser?.email || displayName}</p>
                    </div>

                    <Link
                      href="/bookings/history"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-[#162044] hover:text-[#e5c158] transition"
                    >
                      <span>🏨</span> Xem lịch sử đặt phòng
                    </Link>

                    <button
                      onClick={() => { setIsDropdownOpen(false); setIsProfileModalOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-[#162044] hover:text-[#e5c158] transition text-left"
                    >
                      <span>👤</span> Chỉnh sửa thông tin cá nhân
                    </button>

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition text-left font-semibold"
                    >
                      <span>🚪</span> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MODAL CHỈNH SỬA THÔNG TIN CÁ NHÂN */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#0f1736] border border-slate-700 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative text-white animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-xl font-serif font-bold text-[#e5c158] mb-2">Chỉnh sửa thông tin</h3>
            <p className="text-xs text-slate-400 mb-6">Cập nhật thông tin tài khoản TravelBooking</p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={authUser?.email || ""}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                  className="w-full bg-[#070c1e] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#e5c158]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="w-full bg-[#070c1e] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#e5c158]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#e5c158] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b8972e] text-black font-extrabold py-3 rounded-xl transition text-sm shadow-lg shadow-yellow-500/10"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
