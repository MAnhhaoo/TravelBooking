"use client";

import React, { useState, useEffect } from "react";
import { getVouchersAPI, createVoucherAPI, updateVoucherAPI, deleteVoucherAPI } from "../services/api";
import { motion } from "framer-motion";

export default function OwnerVouchersManager({ activeHotel, myHotels = [] }: { activeHotel?: any; myHotels?: any[] }) {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterScope, setFilterScope] = useState<"all" | "my_hotel" | "global">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);

  const myHotelsList = (myHotels && myHotels.length > 0) ? myHotels : (activeHotel ? [activeHotel] : []);
  const managedHotelIds = myHotelsList.map((h: any) => Number(h.hotel_id));

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "PERCENT",
    discount_value: 10,
    min_order_value: 500000,
    max_discount: 200000,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    usage_limit: 100,
    status: 1,
    hotel_id: Number(activeHotel?.hotel_id || myHotelsList[0]?.hotel_id || 0)
  });

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await getVouchersAPI();
      // Owner nhìn thấy voucher của các khách sạn họ quản lý + voucher toàn hệ thống (is_global)
      const myHotelsVouchers = (data || []).filter(
        (v: any) => !v.hotel_id || managedHotelIds.includes(Number(v.hotel_id)) || Number(v.hotel_id) === Number(activeHotel?.hotel_id)
      );
      setVouchers(myHotelsVouchers);
    } catch (err) {
      console.error("Lỗi tải voucher:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeHotel?.hotel_id || managedHotelIds.length > 0) {
      fetchVouchers();
    }
  }, [activeHotel?.hotel_id, myHotels?.length]);

  const handleOpenCreateModal = () => {
    setEditingVoucher(null);
    setFormData({
      code: "",
      discount_type: "PERCENT",
      discount_value: 10,
      min_order_value: 500000,
      max_discount: 200000,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      usage_limit: 100,
      status: 1,
      hotel_id: Number(activeHotel?.hotel_id || myHotelsList[0]?.hotel_id || 0)
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (v: any) => {
    setEditingVoucher(v);
    setFormData({
      code: v.code || "",
      discount_type: v.discount_type || "PERCENT",
      discount_value: Number(v.discount_value) || 0,
      min_order_value: Number(v.min_order_value) || 0,
      max_discount: Number(v.max_discount) || 0,
      start_date: v.start_date ? new Date(v.start_date).toISOString().slice(0, 10) : "",
      end_date: v.end_date ? new Date(v.end_date).toISOString().slice(0, 10) : "",
      usage_limit: Number(v.usage_limit) || 100,
      status: Number(v.status) ?? 1,
      hotel_id: Number(v.hotel_id || activeHotel?.hotel_id || myHotelsList[0]?.hotel_id || 0)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      alert("Vui lòng nhập mã Voucher!");
      return;
    }

    const targetHotelId = Number(formData.hotel_id || activeHotel?.hotel_id || myHotelsList[0]?.hotel_id || 0);
    if (!targetHotelId || targetHotelId <= 0) {
      alert("Vui lòng chọn khách sạn áp dụng!");
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      min_order_value: Number(formData.min_order_value),
      max_discount: Number(formData.max_discount),
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      usage_limit: Number(formData.usage_limit),
      hotel_id: targetHotelId,
      status: Number(formData.status)
    };

    try {
      if (editingVoucher) {
        await updateVoucherAPI(editingVoucher.voucher_id, payload);
        alert("Cập nhật voucher thành công!");
      } else {
        await createVoucherAPI(payload);
        alert("Tạo mới voucher thành công!");
      }
      setShowModal(false);
      fetchVouchers();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Lỗi khi lưu voucher!");
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Bạn có chắc muốn xóa mã ưu đãi ${code}?`)) return;
    try {
      await deleteVoucherAPI(id);
      alert("Xóa thành công!");
      fetchVouchers();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Lỗi khi xóa voucher!");
    }
  };

  const handleToggleStatus = async (v: any) => {
    if (!v.hotel_id) {
      alert("Bạn không thể thay đổi trạng thái của Voucher toàn hệ thống!");
      return;
    }
    const newStatus = v.status === 1 ? 0 : 1;
    try {
      await updateVoucherAPI(v.voucher_id, { status: newStatus });
      fetchVouchers();
    } catch (err) {
      alert("Lỗi cập nhật trạng thái!");
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (filterScope === "my_hotel") return v.hotel_id && (managedHotelIds.includes(Number(v.hotel_id)) || Number(v.hotel_id) === Number(activeHotel?.hotel_id));
    if (filterScope === "global") return !v.hotel_id;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1834] p-6 rounded-2xl border border-slate-800/60 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span>🎟️</span> Quản lý Mã giảm giá Khách sạn
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tạo mã ưu đãi độc quyền để thu hút khách hàng đặt phòng tại <span className="text-[#fbbf24] font-bold">{activeHotel?.hotel_name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#16254c] border border-slate-700/60 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setFilterScope("all")}
              className={`px-3 py-1.5 rounded-lg transition ${filterScope === "all" ? "bg-[#fbbf24] text-slate-950 font-bold" : "text-slate-300 hover:text-white"}`}
            >
              Tất cả ({vouchers.length})
            </button>
            <button
              onClick={() => setFilterScope("my_hotel")}
              className={`px-3 py-1.5 rounded-lg transition ${filterScope === "my_hotel" ? "bg-[#fbbf24] text-slate-950 font-bold" : "text-slate-300 hover:text-white"}`}
            >
              Khách sạn ({vouchers.filter((v) => v.hotel_id && (managedHotelIds.includes(Number(v.hotel_id)) || Number(v.hotel_id) === Number(activeHotel?.hotel_id))).length})
            </button>
            <button
              onClick={() => setFilterScope("global")}
              className={`px-3 py-1.5 rounded-lg transition ${filterScope === "global" ? "bg-[#fbbf24] text-slate-950 font-bold" : "text-slate-300 hover:text-white"}`}
            >
              Hệ thống ({vouchers.filter((v) => !v.hotel_id).length})
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#fbbf24] hover:bg-yellow-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition transform active:scale-95 cursor-pointer"
          >
            <span>+ Tạo Voucher cho Khách sạn</span>
          </button>
        </div>
      </div>

      <div className="bg-[#0e1834] border border-slate-800/60 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#0a1225]">
                <th className="px-5 py-3.5">Mã Code</th>
                <th className="px-5 py-3.5">Mức Giảm</th>
                <th className="px-5 py-3.5">Phân Loại</th>
                <th className="px-5 py-3.5">Điều Kiện</th>
                <th className="px-5 py-3.5">Thời Gian Áp Dụng</th>
                <th className="px-5 py-3.5">Đã Dùng</th>
                <th className="px-5 py-3.5 text-center">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    ⏳ Đang tải mã giảm giá...
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl">🎟️</span>
                      <p>Khách sạn của bạn chưa tạo mã ưu đãi nào.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => {
                  const isGlobal = !v.hotel_id;
                  const isMyHotel = v.hotel_id && (managedHotelIds.includes(Number(v.hotel_id)) || Number(v.hotel_id) === Number(activeHotel?.hotel_id));
                  const hotelObj = v.hotels || myHotelsList.find((h: any) => Number(h.hotel_id) === Number(v.hotel_id));
                  const discountStr =
                    v.discount_type === "PERCENT"
                      ? `${v.discount_value}% (Tối đa ${Number(v.max_discount || 0).toLocaleString()}đ)`
                      : `${Number(v.discount_value || 0).toLocaleString()}đ`;

                  const startDateStr = v.start_date ? new Date(v.start_date).toLocaleDateString("vi-VN") : "—";
                  const endDateStr = v.end_date ? new Date(v.end_date).toLocaleDateString("vi-VN") : "—";
                  const isExpired = v.end_date && new Date(v.end_date) < new Date();

                  return (
                    <tr key={v.voucher_id} className="hover:bg-slate-800/30 transition duration-150">
                      <td className="px-5 py-4 font-mono font-extrabold text-[#fbbf24] text-base">
                        {v.code}
                      </td>
                      <td className="px-5 py-4 font-bold text-white">
                        {discountStr}
                        <div className="text-[11px] text-slate-400 font-normal">
                          {v.discount_type === "PERCENT" ? "Giảm theo %" : "Tiền mặt cố định"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {isGlobal ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            🌐 Toàn Hệ Thống
                          </span>
                        ) : (
                          <div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#fbbf24]/20 text-[#fbbf24] border border-yellow-500/30">
                              🏨 Độc Quyền KS
                            </span>
                            {hotelObj?.hotel_name && (
                              <div className="text-[11px] text-slate-300 font-semibold mt-1">
                                {hotelObj.hotel_name}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-300">
                        Đơn tối thiểu: <span className="font-bold text-white">{Number(v.min_order_value || 0).toLocaleString()}đ</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        <div>từ: {startDateStr}</div>
                        <div>đến: {endDateStr}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-bold text-white">
                          {v.used_count || 0} / {v.usage_limit || 0}
                        </div>
                        <div className="w-20 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className="bg-[#fbbf24] h-full rounded-full"
                            style={{ width: `${Math.min(100, ((v.used_count || 0) / (v.usage_limit || 1)) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {isExpired ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Đã hết hạn
                          </span>
                        ) : v.status === 1 ? (
                          <button
                            onClick={() => isMyHotel && handleToggleStatus(v)}
                            disabled={!isMyHotel}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${isMyHotel ? "hover:bg-emerald-500/20 cursor-pointer" : "cursor-default"}`}
                          >
                            ● Hoạt động
                          </button>
                        ) : (
                          <button
                            onClick={() => isMyHotel && handleToggleStatus(v)}
                            disabled={!isMyHotel}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30 ${isMyHotel ? "hover:bg-slate-500/30 cursor-pointer" : "cursor-default"}`}
                          >
                            ○ Tạm khóa
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isMyHotel ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(v)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold transition border border-blue-500/30"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(v.voucher_id, v.code)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold transition border border-rose-500/30"
                            >
                              Xóa
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Voucher chung</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0e1834] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#132042]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{editingVoucher ? "✏️ Cập nhật Voucher Khách Sạn" : "✨ Tạo Voucher Độc Quyền"}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">MÃ VOUCHER (CODE) *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: VIP2026, SUMMER500"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#16254c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#fbbf24] focus:outline-none focus:border-[#fbbf24]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">LOẠI GIẢM GIÁ</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full bg-[#16254c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#fbbf24]"
                  >
                    <option value="PERCENT">Giảm theo %</option>
                    <option value="FIXED">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {formData.discount_type === "PERCENT" ? "TỶ LỆ GIẢM (%)" : "SỐ TIỀN GIẢM (VNĐ)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    className="w-full bg-[#16254c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ĐƠN TỐI THIỂU (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: Number(e.target.value) })}
                    className="w-full bg-[#16254c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">GIẢM TỐI ĐA (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
                    className="w-full bg-[#16254c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">NGÀY BẮT ĐẦU</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-[#16254c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white [color-scheme:dark] focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">NGÀY KẾT THÚC</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-[#16254c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white [color-scheme:dark] focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">GIỚI HẠN SỬ DỤNG (LƯỢT)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                    className="w-full bg-[#16254c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">TRẠNG THÁI</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                    className="w-full bg-[#16254c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#fbbf24]"
                  >
                    <option value={1}>Hoạt động</option>
                    <option value={0}>Tạm khóa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">PHẠM VI ÁP DỤNG (KHÁCH SẠN) *</label>
                {myHotelsList.length > 1 ? (
                  <select
                    value={formData.hotel_id || activeHotel?.hotel_id || myHotelsList[0]?.hotel_id}
                    onChange={(e) => setFormData({ ...formData, hotel_id: Number(e.target.value) })}
                    className="w-full bg-[#16254c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#fbbf24]"
                  >
                    {myHotelsList.map((h: any) => (
                      <option key={h.hotel_id} value={h.hotel_id}>
                        🏨 {h.hotel_name} (ID: #{h.hotel_id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={`🏨 Khách sạn: ${myHotelsList[0]?.hotel_name || activeHotel?.hotel_name || ""}`}
                    className="w-full bg-[#132042] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#fbbf24] opacity-80"
                  />
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#fbbf24] hover:bg-yellow-400 text-slate-950 text-xs font-extrabold shadow-lg transition transform active:scale-95"
                >
                  {editingVoucher ? "Lưu Cập Nhật" : "Tạo Voucher"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
