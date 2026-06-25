"use client";

import { useEffect, useState } from "react";
import { getUsersAPI, getHotelsAPI, updateHotelStatusAPI } from "../../../services/api";
import { mapUserRole, formatDate } from "../../../utils/dataMappers";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [usersData, hotelsData] = await Promise.all([
          getUsersAPI(),
          getHotelsAPI()
        ]);
        setUsers(usersData);
        setHotels(hotelsData);
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
      // Cập nhật lại state local
      setHotels(hotels.map(h => h.hotel_id === hotelId ? { ...h, status } : h));
      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái!");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Tổng quan Hệ thống</h1>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab("users")}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === "users" ? "bg-red-900 text-white shadow-md" : "bg-white text-gray-600 border"}`}
        >
          👤 Quản lý Người dùng ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab("hotels")}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === "hotels" ? "bg-red-900 text-white shadow-md" : "bg-white text-gray-600 border"}`}
        >
          🏢 Duyệt Khách Sạn ({hotels.length})
        </button>
      </div>

      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-sm font-semibold text-gray-600">ID</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Họ và tên</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Vai trò</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleData = mapUserRole(user.role);
                  return (
                    <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4 text-sm font-medium text-gray-500">#{user.id}</td>
                      <td className="p-4 font-bold text-gray-800">{user.fullName}</td>
                      <td className="p-4 text-sm text-gray-600">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleData.bg} ${roleData.color}`}>
                          {roleData.text}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "hotels" && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-sm font-semibold text-gray-600">Khách sạn</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Vị trí</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Chủ sở hữu (ID)</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => (
                  <tr key={hotel.hotel_id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={hotel.hotel_images?.[0]?.image_url || "/placeholder.jpg"} className="w-12 h-12 rounded object-cover" alt="" />
                        <div>
                          <p className="font-bold text-gray-800">{hotel.hotel_name}</p>
                          <p className="text-xs text-yellow-500">{"⭐".repeat(hotel.star_rating || 0)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{hotel.city}</td>
                    <td className="p-4 text-sm text-gray-600">User #{hotel.owner_id}</td>
                    <td className="p-4">
                      {hotel.status === 1 ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Hoạt động</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">Chờ duyệt</span>
                      )}
                    </td>
                    <td className="p-4">
                      {hotel.status === 0 ? (
                        <button 
                          onClick={() => handleUpdateHotelStatus(hotel.hotel_id, 1)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded transition"
                        >
                          Phê duyệt
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateHotelStatus(hotel.hotel_id, 0)}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded transition"
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
        )}
      </motion.div>
    </div>
  );
}