"use client";

import React, { useState, useEffect } from "react";
import { getVouchersAPI, createVoucherAPI, updateVoucherAPI, deleteVoucherAPI } from "../services/api";
import { motion } from "framer-motion";

export default function AdminVouchersManager({ hotels = [] }: { hotels?: any[] }) {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "global" | "hotel">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "PERCENT",
    discount_value: 10,
    min_order_value: 500000,
    max_discount: 200000,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    usage_limit: 100,
    hotel_id: "", // "" means global (null)
    status: 1
  });

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await getVouchersAPI();
      setVouchers(data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách voucher:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

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
      hotel_id: "",
      status: 1
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
      hotel_id: v.hotel_id ? String(v.hotel_id) : "",
      status: Number(v.status) ?? 1
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      alert("Vui lòng nhập mã Voucher (Code)");
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
      hotel_id: formData.hotel_id ? Number(formData.hotel_id) : null,
      status: Number(formData.status)
    };

    try {
      if (editingVoucher) {
        await updateVoucherAPI(editingVoucher.voucher_id, payload);
        alert("Cập nhật Voucher thành công!");
      } else {
        await createVoucherAPI(payload);
        alert("Tạo mới Voucher thành công!");
      }
      setShowModal(false);
      fetchVouchers();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Có lỗi xảy ra khi lưu Voucher!");
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã ưu đãi ${code}?`)) return;
    try {
      await deleteVoucherAPI(id);
      alert("Xóa voucher thành công!");
      fetchVouchers();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể xóa voucher này!");
    }
  };

  const handleToggleStatus = async (v: any) => {
    const newStatus = v.status === 1 ? 0 : 1;
    try {
      await updateVoucherAPI(v.voucher_id, { status: newStatus });
      fetchVouchers();
    } catch (err) {
      alert("Lỗi cập nhật trạng thái voucher");
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (filterType === "global") return !v.hotel_id;
    if (filterType === "hotel") return !!v.hotel_id;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🎟️</span> Quản lý Mã ưu đãi / Voucher
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý toàn bộ voucher toàn hệ thống và voucher riêng của từng khách sạn
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter buttons */}
          <div className="flex bg-[#111c38] border border-blue-900/40 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg transition ${filterType === "all" ? "bg-yellow-500 text-slate-950 font-bold" : "text-slate-300 hover:text-white"}`}
            >
              Tất cả ({vouchers.length})
            </button>
            <button
              onClick={() => setFilterType("global")}
              className={`px-3 py-1.5 rounded-lg transition ${filterType === "global" ? "bg-yellow-500 text-slate-950 font-bold" : "text-slate-300 hover:text-white"}`}
            >
              Hệ thống ({vouchers.filter((v) => !v.hotel_id).length})
            </button>
            <button
              onClick={() => setFilterType("hotel")}
              className={`px-3 py-1.5 rounded-lg transition ${filterType === "hotel" ? "bg-yellow-500 text-slate-950 font-bold" : "text-slate-300 hover:text-white"}`}
            >
              Khách sạn ({vouchers.filter((v) => !!v.hotel_id).length})
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-yellow-500/20 transition transform active:scale-95"
          >
            <span>+ Tạo Voucher mới</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#111c38] border border-blue-900/40 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-blue-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#0d1833]">
                <th className="px-5 py-3.5">Mã Voucher</th>
                <th className="px-5 py-3.5">Mức Giảm</th>
                <th className="px-5 py-3.5">Phạm Vi / Khách Sạn</th>
                <th className="px-5 py-3.5">Điều Kiện & Giới Hạn</th>
                <th className="px-5 py-3.5">Thời Gian Áp Dụng</th>
                <th className="px-5 py-3.5">Sử Dụng</th>
                <th className="px-5 py-3.5 text-center">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/20 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    ⏳ Đang tải dữ liệu voucher...
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl">🎟️</span>
                      <p>Chưa có mã ưu đãi / voucher nào.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => {
                  const isGlobal = !v.hotel_id;
                  const hotelObj = hotels.find((h) => h.hotel_id === v.hotel_id) || v.hotels;
                  const hotelName = isGlobal ? "Toàn Hệ Thống" : hotelObj?.hotel_name || `Khách sạn #${v.hotel_id}`;
                  const discountStr =
                    v.discount_type === "PERCENT"
                      ? `${v.discount_value}% (Tối đa ${Number(v.max_discount || 0).toLocaleString()}đ)`
                      : `${Number(v.discount_value || 0).toLocaleString()}đ`;

                  const startDateStr = v.start_date ? new Date(v.start_date).toLocaleDateString("vi-VN") : "—";
                  const endDateStr = v.end_date ? new Date(v.end_date).toLocaleDateString("vi-VN") : "—";

                  const usedCount = v.used_count || 0;
                  const usageLimit = v.usage_limit || 0;
                  const isExpired = v.end_date && new Date(v.end_date) < new Date();

                  return (
                    <tr key={v.voucher_id} className="hover:bg-blue-900/10 transition duration-150">
                      <td className="px-5 py-4 font-mono font-extrabold text-yellow-400 tracking-wide text-base">
                        {v.code}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-white">{discountStr}</span>
                        <div className="text-[11px] text-slate-400 uppercase font-semibold">
                          Loại: {v.discount_type === "PERCENT" ? "Theo %" : "Số tiền cố định"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {isGlobal ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            🌐 Toàn Hệ Thống
                          </span>
                        ) : (
                          <div className="max-w-[180px]">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 truncate max-w-full">
                              🏨 {hotelName}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-300 space-y-1">
                        <div>
                          Đơn tối thiểu: <span className="font-bold text-white">{Number(v.min_order_value || 0).toLocaleString()}đ</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        <div>từ: {startDateStr}</div>
                        <div>đến: {endDateStr}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-bold text-white">
                          {usedCount} / {usageLimit}
                        </div>
                        <div className="w-20 bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="bg-yellow-400 h-full rounded-full"
                            style={{ width: `${Math.min(100, (usedCount / (usageLimit || 1)) * 100)}%` }}
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
                            onClick={() => handleToggleStatus(v)}
                            title="Click để tạm khóa"
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer"
                          >
                            ● Hoạt động
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(v)}
                            title="Click để kích hoạt"
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30 transition cursor-pointer"
                          >
                            ○ Tạm khóa
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0e1834] border border-blue-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="px-6 py-4 border-b border-blue-900/40 flex items-center justify-between bg-[#132042]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{editingVoucher ? "✏️ Cập nhật Voucher" : "✨ Tạo mới Voucher"}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold px-2 py-0.5"
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
                  placeholder="VD: SUMMER2026, WELCOME50"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#16254c] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-yellow-400 placeholder:text-slate-500 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">LOẠI GIẢM GIÁ</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full bg-[#16254c] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-yellow-500"
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
                    className="w-full bg-[#16254c] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-yellow-500"
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
                    className="w-full bg-[#16254c] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">GIẢM TỐI ĐA (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
                    className="w-full bg-[#16254c] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-yellow-500"
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
                    className="w-full bg-[#16254c] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white [color-scheme:dark] focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">NGÀY KẾT THÚC</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-[#16254c] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white [color-scheme:dark] focus:outline-none focus:border-yellow-500"
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
                    className="w-full bg-[#16254c] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">TRẠNG THÁI</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                    className="w-full bg-[#16254c] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value={1}>Hoạt động</option>
                    <option value={0}>Tạm khóa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">PHẠM VI ÁP DỤNG (KHÁCH SẠN)</label>
                <select
                  value={formData.hotel_id}
                  onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
                  className="w-full bg-[#16254c] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-yellow-500"
                  disabled={!!(editingVoucher && editingVoucher.hotel_id)} // Nếu là owner hay đã gán thì tùy ý, ở Admin cho phép đổi hoặc chọn
                >
                  <option value="">🌐 Toàn Hệ Thống (Mọi Khách Sạn)</option>
                  {hotels.map((h: any) => (
                    <option key={h.hotel_id} value={h.hotel_id}>
                      🏨 {h.hotel_name} ({h.city})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Chọn "Toàn Hệ Thống" nếu muốn mọi khách sạn đều áp dụng được mã ưu đãi này.
                </p>
              </div>

              <div className="pt-4 border-t border-blue-900/40 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 text-xs font-extrabold shadow-lg transition transform active:scale-95"
                >
                  {editingVoucher ? "Lưu thay đổi" : "Tạo Voucher"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
