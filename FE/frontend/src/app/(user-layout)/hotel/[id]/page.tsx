"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getHotelByIdAPI, getRoomsByHotelAPI, getReviewsByHotelAPI, createBookingAPI, createPaymentAPI } from "../../../../services/api";
import { formatCurrencyVND } from "../../../../utils/dataMappers";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const authUser = useSelector((state: any) => state.auth?.user);

  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking state
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [hotelData, roomsData, reviewsData]: any[] = await Promise.all([
          getHotelByIdAPI(id),
          getRoomsByHotelAPI(id),
          getReviewsByHotelAPI(id)
        ]);
        setHotel(hotelData);
        // getRoomsByHotelAPI trả về { data: [...] }, phải unwrap .data
        setRooms(Array.isArray(roomsData) ? roomsData : ((roomsData as any)?.data || []));
        setReviews((reviewsData as any)?.data || reviewsData || []);
      } catch (error) {
        console.error("Lỗi fetch chi tiết khách sạn:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  const handleOpenBooking = (room: any) => {
    if (!authUser) {
      alert("Vui lòng đăng nhập để đặt phòng!");
      router.push("/login");
      return;
    }
    router.push(`/bookings/checkout?hotelId=${id}&roomId=${room.room_id}&price=${room.price_per_night}&hotelName=${encodeURIComponent(hotel?.hotel_name || "Khách sạn")}&roomNumber=${room.room_number || "Tiêu chuẩn"}`);
  };

  const submitBooking = async () => {
    if (!checkIn || !checkOut) {
      alert("Vui lòng chọn ngày nhận và trả phòng");
      return;
    }

    setBookingLoading(true);
    try {
      // 1. Tính toán
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const totalPrice = Number(selectedRoom.price_per_night) * nights;

      // 2. Tạo Booking
      await createBookingAPI({
        user_id: authUser.user_id,
        room_id: selectedRoom.room_id,
        guest_count: 2, // Hardcode tạm 2
        check_in: new Date(checkIn).toISOString(),
        check_out: new Date(checkOut).toISOString(),
        total_price: totalPrice,
        status: 1 // Xác nhận luôn (Mock)
      });

      alert("Đặt phòng thành công!");
      setIsBookingModalOpen(false);
      
      // Load lại danh sách phòng (để cập nhật status nếu cần)
      const updatedRooms = await getRoomsByHotelAPI(id);
      setRooms(updatedRooms);

    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi đặt phòng. Backend từ chối do data thiếu hoặc DB config.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070c1e] flex items-center justify-center text-[#e5c158]">
        <div className="text-2xl animate-pulse">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!hotel) {
    return <div className="min-h-screen bg-[#070c1e] text-white p-20 text-center text-2xl">Không tìm thấy khách sạn!</div>;
  }

  // Tính rating
  const avgRating = reviews?.length 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "Chưa có đánh giá";

  return (
    <div className="bg-[#070c1e] min-h-screen text-white font-sans pb-24">
      
      {/* 1. BANNER & THÔNG TIN CHUNG */}
      <div className="max-w-7xl mx-auto px-4 pt-12">
        <div className="flex gap-2 text-xs text-[#e5c158] font-bold tracking-widest uppercase mb-4">
          <span>{hotel.city || "Thành phố"}</span>
          <span>•</span>
          <span>Chi tiết khách sạn</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 text-white">
          {hotel.hotel_name}
        </h1>

        <div className="flex items-center gap-4 text-sm text-slate-400 mb-8">
          <span className="flex items-center gap-1 text-[#e5c158] font-bold bg-[#e5c158]/10 px-3 py-1 rounded-full">
            ⭐ {avgRating} ({reviews?.length || 0} đánh giá)
          </span>
          <span>📍 {hotel.address}, {hotel.city}</span>
          <span>📞 {hotel.phone}</span>
        </div>

        {/* ẢNH GALLERY */}
        <div className="grid grid-cols-4 gap-4 h-[400px] md:h-[500px] mb-12 rounded-3xl overflow-hidden border border-slate-800/50">
          <div className="col-span-4 md:col-span-3 h-full relative group">
            <img 
              src={hotel.hotel_images?.[0]?.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945"} 
              className="w-full h-full object-cover transition duration-700 group-hover:scale-105" 
              alt="Main"
            />
          </div>
          <div className="hidden md:flex flex-col gap-4 h-full">
            <img src={hotel.hotel_images?.[1]?.image_url || "https://images.unsplash.com/photo-1542314831-c6a4d27ce6a2"} className="h-1/2 w-full object-cover rounded-xl" alt="Sub 1"/>
            <img src={hotel.hotel_images?.[2]?.image_url || "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"} className="h-1/2 w-full object-cover rounded-xl" alt="Sub 2"/>
          </div>
        </div>
      </div>

      {/* 2. NỘI DUNG CHI TIẾT & CHỌN PHÒNG */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* CỘT TRÁI: MÔ TẢ & TIỆN NGHI */}
        <div className="lg:col-span-2 space-y-12">
          
          <section className="bg-[#0f1736] p-8 rounded-3xl border border-slate-800/50">
            <h2 className="text-2xl font-serif mb-4 text-[#e5c158]">Mô tả khách sạn</h2>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
              {hotel.description || "Khách sạn cao cấp mang đến trải nghiệm nghỉ dưỡng tuyệt vời cho bạn và gia đình."}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-6 text-white border-b border-slate-800 pb-4">Đánh giá nổi bật</h2>
            {reviews?.length === 0 ? (
              <p className="text-slate-500">Chưa có đánh giá nào cho khách sạn này.</p>
            ) : (
              <div className="grid gap-4">
                {reviews?.slice(0, 4).map((r: any, idx: number) => (
                  <div key={idx} className="bg-[#0f1736] p-5 rounded-2xl border border-slate-800/40">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[#e5c158]">Khách hàng ẩn danh</span>
                      <span className="text-sm bg-black/30 px-2 py-1 rounded text-yellow-400">{'⭐'.repeat(r.rating || 5)}</span>
                    </div>
                    <p className="text-slate-300 text-sm italic">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* CỘT PHẢI: DANH SÁCH PHÒNG (BOOKING) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-[#0f1736] p-6 rounded-3xl border border-slate-800/50 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-[#e5c158] uppercase tracking-wider">Chọn phòng của bạn</h2>
            
            {rooms?.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-slate-700 rounded-xl">
                <p className="text-slate-400 text-sm">Hiện chưa có phòng nào khả dụng tại đây.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rooms.map((room: any) => (
                  <div key={room.room_id} className="bg-[#161f3d] rounded-2xl p-4 border border-slate-700/50 hover:border-[#e5c158]/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white">Phòng {room.room_number || "Tiêu chuẩn"}</h4>
                        <p className="text-xs text-slate-400 mt-1">Trạng thái: <span className={room.status === 0 ? "text-emerald-400" : "text-red-400"}>{room.status === 0 ? "Trống" : "Đã đặt"}</span></p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-end justify-between">
                      <div>
                        <p className="text-sm text-slate-500 line-through">{formatCurrencyVND(Number(room.price_per_night) * 1.2)}</p>
                        <p className="text-lg font-bold text-[#e5c158]">{formatCurrencyVND(room.price_per_night)}</p>
                      </div>
                      <button 
                        onClick={() => handleOpenBooking(room)}
                        disabled={room.status !== 0}
                        className={`px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-wide transition ${room.status === 0 ? 'bg-[#e5c158] text-black hover:bg-[#d4af37]' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                      >
                        {room.status === 0 ? "Đặt ngay" : "Hết phòng"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL ĐẶT PHÒNG */}
      {isBookingModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1736] border border-[#e5c158]/20 w-full max-w-md rounded-3xl p-8 relative shadow-[0_0_50px_rgba(229,193,88,0.1)]"
          >
            <button onClick={() => setIsBookingModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              ✕
            </button>
            <h3 className="text-2xl font-serif text-[#e5c158] mb-2">Xác nhận đặt phòng</h3>
            <p className="text-slate-400 text-sm mb-6">Phòng {selectedRoom.room_number} - {hotel.hotel_name}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Ngày nhận phòng (Check-in)</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-[#161f3d] p-3 rounded-xl border border-slate-700 text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Ngày trả phòng (Check-out)</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-[#161f3d] p-3 rounded-xl border border-slate-700 text-white" />
              </div>

              <div className="bg-[#161f3d] p-4 rounded-xl border border-slate-700 mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Giá 1 đêm:</span>
                  <span className="text-white">{formatCurrencyVND(selectedRoom.price_per_night)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4 border-b border-slate-700 pb-4">
                  <span className="text-slate-400">Số lượng khách:</span>
                  <span className="text-white">2 Khách</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#e5c158]">Tổng tiền tạm tính:</span>
                  <span className="text-xl font-bold text-[#e5c158]">
                    {formatCurrencyVND(Number(selectedRoom.price_per_night) * Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000) || 1))}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={submitBooking}
              disabled={bookingLoading}
              className="w-full mt-6 bg-gradient-to-r from-[#e5c158] to-[#d4af37] text-black font-bold py-4 rounded-xl uppercase tracking-widest shadow-[0_4px_20px_rgba(229,193,88,0.2)] hover:shadow-[0_8px_32px_rgba(229,193,88,0.4)] transition-all"
            >
              {bookingLoading ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
