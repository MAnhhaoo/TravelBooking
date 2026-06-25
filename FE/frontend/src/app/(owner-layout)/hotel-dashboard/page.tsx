"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getHotelsAPI, getAllRoomsAPI } from "../../../services/api";
import { mapRoomStatus, formatCurrencyVND } from "../../../utils/dataMappers";
import { motion } from "framer-motion";

export default function OwnerDashboardPage() {
  const authUser = useSelector((state: any) => state.auth?.user);
  const router = useRouter();

  const [myHotels, setMyHotels] = useState<any[]>([]);
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hotels");

  useEffect(() => {
    // Note: Mock hoặc cần có Redux persist để lấy đúng Auth
    // Tạm thời nếu không có authUser, giả lập 1 Owner ID = 2
    const ownerId = authUser?.user_id || 2; 

    const fetchOwnerData = async () => {
      setLoading(true);
      try {
        const [hotelsData, roomsData] = await Promise.all([
          getHotelsAPI(),
          getAllRoomsAPI()
        ]);
        
        // Frontend logic: Lọc dữ liệu khách sạn thuộc sở hữu của User hiện tại
        const filteredHotels = hotelsData.filter((h: any) => h.owner_id === ownerId);
        setMyHotels(filteredHotels);

        // Lọc tất cả các phòng nằm trong danh sách khách sạn của Owner này
        const myHotelIds = filteredHotels.map((h: any) => h.hotel_id);
        const filteredRooms = roomsData.filter((r: any) => myHotelIds.includes(r.hotel_id));
        setMyRooms(filteredRooms);

      } catch (error) {
        console.error("Lỗi fetch dữ liệu Owner:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOwnerData();
  }, [authUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Quản lý Khách sạn của tôi</h1>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab("hotels")}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === "hotels" ? "bg-emerald-900 text-white shadow-md" : "bg-white text-gray-600 border"}`}
        >
          🏨 Khách sạn ({myHotels.length})
        </button>
        <button 
          onClick={() => setActiveTab("rooms")}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === "rooms" ? "bg-emerald-900 text-white shadow-md" : "bg-white text-gray-600 border"}`}
        >
          🛏️ Danh sách Phòng ({myRooms.length})
        </button>
      </div>

      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* TAB KHÁCH SẠN */}
        {activeTab === "hotels" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myHotels.map((hotel) => (
              <div key={hotel.hotel_id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition group">
                <div className="h-40 bg-gray-200 overflow-hidden relative">
                  <img 
                    src={hotel.hotel_images?.[0]?.image_url || "/placeholder.jpg"} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    alt="hotel" 
                  />
                  {hotel.status === 1 ? (
                    <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow">Đã duyệt</span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded shadow">Chờ duyệt</span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{hotel.hotel_name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">📍 {hotel.city}</p>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">{hotel.description}</p>
                  
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-emerald-700 text-sm font-bold">⭐ {hotel.star_rating} Sao</span>
                    <button className="text-emerald-600 text-sm font-bold hover:underline">Chỉnh sửa</button>
                  </div>
                </div>
              </div>
            ))}
            {myHotels.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-500 border border-dashed rounded-xl">
                Bạn chưa sở hữu khách sạn nào.
              </div>
            )}
          </div>
        )}

        {/* TAB PHÒNG */}
        {activeTab === "rooms" && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-sm font-semibold text-gray-600">Khách sạn</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Số phòng</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Loại phòng (ID)</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Giá 1 đêm</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {myRooms.map((room) => {
                  const statusData = mapRoomStatus(room.status);
                  const hotelName = myHotels.find(h => h.hotel_id === room.hotel_id)?.hotel_name || `ID: ${room.hotel_id}`;
                  return (
                    <tr key={room.room_id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4 text-sm font-medium text-gray-800 line-clamp-1 max-w-[200px]">{hotelName}</td>
                      <td className="p-4 font-bold text-emerald-800">{room.room_number || `P.${room.room_id}`}</td>
                      <td className="p-4 text-sm text-gray-600">Type {room.room_type_id}</td>
                      <td className="p-4 font-bold text-amber-600">{formatCurrencyVND(room.price_per_night)}</td>
                      <td className="p-4">
                        <span className={`text-sm font-bold ${statusData.color}`}>
                          {statusData.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {myRooms.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Chưa có phòng nào được tạo cho các khách sạn của bạn.
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}