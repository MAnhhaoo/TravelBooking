/**
 * utils/dataMappers.js
 * Các hàm biến đổi dữ liệu (Data Transformer) giúp Frontend thích nghi hoàn toàn
 * với cấu trúc dữ liệu của Backend mà không cần phải thay đổi logic ở BE.
 */

// ======================= 1. USER MAPPERS =======================

/**
 * Biến đổi Role ID thành Text hiển thị
 */
export const mapUserRole = (role) => {
  switch (Number(role)) {
    case 0:
      return { text: "Khách hàng", color: "text-blue-400", bg: "bg-blue-400/10" };
    case 1:
      return { text: "Chủ Khách Sạn", color: "text-[#e5c158]", bg: "bg-yellow-500/10" };
    case 2:
      return { text: "Quản trị viên", color: "text-red-400", bg: "bg-red-400/10" };
    default:
      return { text: "Chưa xác định", color: "text-slate-400", bg: "bg-slate-400/10" };
  }
};

// ======================= 2. BOOKING MAPPERS =======================

/**
 * Biến đổi Status Booking thành Text hiển thị
 */
export const mapBookingStatus = (status) => {
  switch (Number(status)) {
    case 0:
      return { text: "Chờ xác nhận", badge: "bg-amber-500/20 text-amber-500 border-amber-500/30" };
    case 1:
      return { text: "Đã xác nhận", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    case 2:
      return { text: "Đã hủy", badge: "bg-red-500/20 text-red-400 border-red-500/30" };
    case 3:
      return { text: "Hoàn thành", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    default:
      return { text: "Không rõ", badge: "bg-slate-500/20 text-slate-400 border-slate-500/30" };
  }
};

// ======================= 3. PAYMENT MAPPERS =======================

/**
 * Biến đổi Status Thanh toán thành Text
 */
export const mapPaymentStatus = (status) => {
  switch (Number(status)) {
    case 0:
      return { text: "Chưa thanh toán", badge: "bg-red-500/20 text-red-400" };
    case 1:
      return { text: "Đã thanh toán", badge: "bg-emerald-500/20 text-emerald-400" };
    default:
      return { text: "Lỗi thanh toán", badge: "bg-slate-500/20 text-slate-400" };
  }
};

// ======================= 4. ROOM MAPPERS =======================

/**
 * Biến đổi Status Phòng thành Text
 */
export const mapRoomStatus = (status) => {
  switch (Number(status)) {
    case 0:
      return { text: "Phòng trống", color: "text-emerald-400" };
    case 1:
      return { text: "Đã được đặt", color: "text-red-400" };
    case 2:
      return { text: "Đang bảo trì", color: "text-amber-500" };
    default:
      return { text: "Không xác định", color: "text-slate-400" };
  }
};

// ======================= 5. CURRENCY & DATE =======================

/**
 * Format số tiền chuẩn VNĐ
 * Input: 1500000 hoặc "1500000"
 * Output: "1.500.000 ₫"
 */
export const formatCurrencyVND = (amount) => {
  if (!amount) return "0 ₫";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

/**
 * Tính số đêm dựa trên check_in và check_out
 */
export const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays > 0 ? diffDays : 1; // Mặc định ít nhất 1 đêm
};

/**
 * Format ngày tháng (dd/mm/yyyy)
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const day = `0${d.getDate()}`.slice(-2);
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};
