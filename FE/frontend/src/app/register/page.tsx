"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAPI } from "../../services/api";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Bạn phải đồng ý với Điều khoản dịch vụ.");
      return;
    }

    setLoading(true);
    try {
      // Gửi đủ các field bao gồm password để BE hash và lưu DB
      await registerAPI({ fullName, email, phone, password });
      setSuccessMsg("Tạo tài khoản thành công! Đang chuyển hướng đến đăng nhập...");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Lỗi tạo tài khoản. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#070c1e] text-white min-h-screen flex items-center justify-center py-20 px-6 font-sans relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl bg-[#0f1731]/60 border border-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md relative z-10"
      >
        <div className="text-center mb-10">
          <span className="text-[#e5c158] text-xs uppercase tracking-widest font-bold block mb-3">
            HỘI VIÊN TRAVELBOOKING
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-light tracking-wide mb-3">
            Tạo tài khoản <span className="italic text-[#e5c158] font-normal">mới</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            Nhận ngay các ưu đãi độc quyền lên đến 40% và tích lũy điểm thưởng khi đặt phòng.
          </p>
        </div>

        {errorMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center font-medium">
            ⚠️ {errorMsg}
          </motion.div>
        )}

        {successMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm text-center font-medium">
            ✅ {successMsg}
          </motion.div>
        )}

        <form className="space-y-6" onSubmit={handleRegister}>
          
          <div className="space-y-2.5">
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block">Họ và tên *</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A" 
              className="w-full bg-[#161f3d] border border-slate-800 rounded-xl px-5 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-[#e5c158]/50 focus:shadow-[0_0_15px_rgba(229,193,88,0.1)] transition" 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block">Địa chỉ Email *</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com" 
                className="w-full bg-[#161f3d] border border-slate-800 rounded-xl px-5 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-[#e5c158]/50 focus:shadow-[0_0_15px_rgba(229,193,88,0.1)] transition" 
                required 
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block">Số điện thoại *</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901 234 567" 
                className="w-full bg-[#161f3d] border border-slate-800 rounded-xl px-5 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-[#e5c158]/50 focus:shadow-[0_0_15px_rgba(229,193,88,0.1)] transition" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2.5 relative">
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block">Mật khẩu *</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-[#161f3d] border border-slate-800 rounded-xl px-5 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-[#e5c158]/50 focus:shadow-[0_0_15px_rgba(229,193,88,0.1)] transition pr-12" 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-[#e5c158] transition text-xs font-semibold"
              >
                {showPassword ? "ẨN" : "HIỆN"}
              </button>
            </div>
          </div>

          <div className="space-y-2.5 relative">
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block">Xác nhận mật khẩu *</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-[#161f3d] border border-slate-800 rounded-xl px-5 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-[#e5c158]/50 focus:shadow-[0_0_15px_rgba(229,193,88,0.1)] transition pr-12" 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-[#e5c158] transition text-xs font-semibold"
              >
                {showConfirmPassword ? "ẨN" : "HIỆN"}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input 
              type="checkbox" 
              id="terms"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              className="w-5 h-5 mt-0.5 rounded accent-[#e5c158] cursor-pointer bg-[#161f3d] border-slate-800"
              required
            />
            <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed cursor-pointer select-none">
              Tôi đồng ý với các <span className="text-[#e5c158] hover:underline cursor-pointer">Điều khoản dịch vụ</span>, <span className="text-[#e5c158] hover:underline cursor-pointer">Chính sách bảo mật</span> của TravelBooking.
            </label>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#e5c158] to-[#d4af37] text-black text-sm font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition tracking-wider uppercase shadow-[0_4px_20px_rgba(229,193,88,0.2)] mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_8px_32px_rgba(229,193,88,0.3)]'}`}
          >
            {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </motion.button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800/60"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-500 font-medium">Hoặc đăng ký bằng</span>
            <div className="flex-grow border-t border-slate-800/60"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="bg-[#161f3d] hover:bg-[#1e2952] border border-slate-800/80 rounded-xl py-3.5 text-xs font-bold transition flex items-center justify-center gap-2 hover:border-[#e5c158]/30">
              <span className="text-base">🌐</span> Google
            </button>
            <button type="button" className="bg-[#161f3d] hover:bg-[#1e2952] border border-slate-800/80 rounded-xl py-3.5 text-xs font-bold transition flex items-center justify-center gap-2 hover:border-[#e5c158]/30">
              <span className="text-base">📘</span> Facebook
            </button>
          </div>

          <div className="text-center pt-4 text-sm text-slate-400">
            Bạn đã có tài khoản rồi?{" "}
            <Link href="/login" className="text-[#e5c158] font-bold hover:underline ml-1">
              Đăng nhập ngay
            </Link>
          </div>

        </form>
      </motion.div>
    </div>
  );
}