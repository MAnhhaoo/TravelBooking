"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice";
import { loginAPI } from "../../services/api";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Gọi API đăng nhập (BE sẽ xử lý bcrypt compare và tạo JWT)
      const data = await loginAPI({ email, password });
      
      // 2. Lưu token và user vào localStorage (kèm theo điều kiện Ghi nhớ)
      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.users));
        } else {
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("user", JSON.stringify(data.users));
        }
      }

      // 3. Dispatch lên Redux Store
      dispatch(
        loginSuccess({
          user: data.users, // Note: BE trả về object tên là `users`
          token: data.token,
        })
      );

      // 4. Điều hướng theo Role
      // role 0: User, 1: Owner, 2: Admin
      const role = data.users?.role;
      if (role === 2) {
        router.push("/admin");
      } else if (role === 1) {
        router.push("/hotel-dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      // Bắt lỗi từ Axios trả về (từ BE)
      setErrorMsg(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#070c1e] text-white min-h-screen flex items-center justify-center py-20 px-6 font-sans relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl bg-[#0f1731]/60 border border-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md relative z-10"
      >
        <div className="text-center mb-10">
          <span className="text-[#e5c158] text-xs uppercase tracking-widest font-bold block mb-3">
            CHÀO MỪNG QUAY TRỞ LẠI
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-light tracking-wide mb-3">
            Đăng nhập <span className="italic text-[#e5c158] font-normal">ngay</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            Tiếp tục hành trình khám phá những điểm đến tuyệt vời cùng TravelBooking.
          </p>
        </div>

        {errorMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center font-medium">
            ⚠️ {errorMsg}
          </motion.div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          
          <div className="space-y-2.5">
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
              Địa chỉ Email *
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com" 
              className="w-full bg-[#161f3d] border border-slate-800 rounded-xl px-5 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-[#e5c158]/50 focus:shadow-[0_0_15px_rgba(229,193,88,0.1)] transition" 
              required 
            />
          </div>

          <div className="space-y-2.5 relative">
            <div className="flex justify-between items-center">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
                Mật khẩu *
              </label>
              <Link href="/forgot-password" className="text-xs text-[#e5c158] hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </div>
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

          <div className="flex items-center gap-3 pt-1">
            <input 
              type="checkbox" 
              id="remember"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="w-5 h-5 rounded accent-[#e5c158] cursor-pointer bg-[#161f3d] border-slate-800"
            />
            <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer select-none font-medium">
              Ghi nhớ đăng nhập trên thiết bị này
            </label>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#e5c158] to-[#d4af37] text-black text-sm font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition tracking-wider uppercase shadow-[0_4px_20px_rgba(229,193,88,0.2)] mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_8px_32px_rgba(229,193,88,0.3)]'}`}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập hệ thống"}
          </motion.button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800/60"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-500 font-medium">Hoặc tiếp tục bằng</span>
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
            Bạn chưa có tài khoản?{" "}
            <Link href="/register" className="text-[#e5c158] font-bold hover:underline ml-1">
              Đăng ký thành viên
            </Link>
          </div>

        </form>
      </motion.div>
    </div>
  );
}