const prisma = require('../configs/database');

/**
 * Lấy danh sách voucher
 * - Admin (role 2): Lấy toàn bộ hoặc lọc theo query params (hotel_id, status)
 * - Owner (role 1): Lấy các voucher của các khách sạn thuộc quyền sở hữu của Owner
 * - Customer / Guest: Lấy các voucher đang active (global hoặc theo hotel_id)
 */
exports.getAllVouchers = async (req, res) => {
  try {
    const user = req.user;
    const { hotel_id, status, is_global } = req.query;
    const where = {};

    if (status !== undefined) {
      where.status = Number(status);
    }

    if (user && (user.role === 2 || user.roleName === 'admin')) {
      // Admin có thể xem tất cả hoặc lọc
      if (hotel_id === 'null' || is_global === 'true') {
        where.hotel_id = null;
      } else if (hotel_id) {
        where.hotel_id = Number(hotel_id);
      }
    } else if (user && (user.role === 1 || ['vendor', 'hotel own', 'owner'].includes(user.roleName))) {
      // Owner chỉ lấy voucher của khách sạn họ sở hữu (hoặc voucher họ tạo)
      const myHotels = await prisma.hotels.findMany({
        where: { owner_id: user.user_id },
        select: { hotel_id: true }
      });
      const myHotelIds = myHotels.map(h => h.hotel_id);
      if (hotel_id) {
        if (!myHotelIds.includes(Number(hotel_id))) {
          return res.status(403).json({ message: "Bạn không có quyền xem voucher của khách sạn này!" });
        }
        where.hotel_id = Number(hotel_id);
      } else {
        where.hotel_id = { in: myHotelIds };
      }
    } else {
      // Khách hàng thông thường hoặc truy vấn công khai: chỉ lấy active
      where.status = 1;
      where.end_date = { gte: new Date() };
      if (hotel_id) {
        where.OR = [
          { hotel_id: null },
          { hotel_id: Number(hotel_id) }
        ];
      } else {
        where.hotel_id = null; // Mặc định hiển thị voucher global
      }
    }

    const vouchers = await prisma.vouchers.findMany({
      where,
      include: {
        hotels: {
          select: {
            hotel_id: true,
            hotel_name: true,
            city: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi lấy danh sách voucher", error: error.message });
  }
};

/**
 * Tạo mới voucher
 */
exports.createVoucher = async (req, res) => {
  try {
    const user = req.user;
    const {
      code,
      discount_type,
      discount_value,
      min_order_value,
      max_discount,
      start_date,
      end_date,
      usage_limit,
      hotel_id,
      status
    } = req.body;

    if (!code || !discount_type || discount_value === undefined || !end_date) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc (code, discount_type, discount_value, end_date)!" });
    }

    const cleanCode = code.trim().toUpperCase();

    // Kiểm tra trùng code
    const existing = await prisma.vouchers.findUnique({
      where: { code: cleanCode }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: `Mã voucher '${cleanCode}' đã tồn tại trong hệ thống!` });
    }

    let finalHotelId = null;
    if (hotel_id && Number(hotel_id) > 0) {
      finalHotelId = Number(hotel_id);
      // Nếu là Owner (không phải Admin), kiểm tra quyền sở hữu khách sạn
      if (user && user.role !== 2 && user.roleName !== 'admin') {
        const hotel = await prisma.hotels.findUnique({ where: { hotel_id: finalHotelId } });
        if (!hotel || Number(hotel.owner_id) !== Number(user.user_id)) {
          return res.status(403).json({ success: false, message: "Bạn không có quyền tạo voucher cho khách sạn này!" });
        }
      }
    } else {
      // Nếu tạo voucher Global (hotel_id = null), bắt buộc phải là Admin
      if (!user || (user.role !== 2 && user.roleName !== 'admin')) {
        return res.status(403).json({ success: false, message: "Chỉ Admin mới có quyền tạo Voucher áp dụng toàn hệ thống!" });
      }
    }

    const newVoucher = await prisma.vouchers.create({
      data: {
        code: cleanCode,
        discount_type,
        discount_value: Number(discount_value),
        min_order_value: min_order_value !== undefined && min_order_value !== "" ? Number(min_order_value) : 0,
        max_discount: max_discount !== undefined && max_discount !== "" ? Number(max_discount) : null,
        start_date: start_date ? new Date(start_date) : new Date(),
        end_date: new Date(end_date),
        usage_limit: usage_limit !== undefined && usage_limit !== "" ? Number(usage_limit) : 100,
        used_count: 0,
        hotel_id: finalHotelId,
        status: status !== undefined ? Number(status) : 1
      },
      include: {
        hotels: {
          select: { hotel_id: true, hotel_name: true }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: "Tạo voucher thành công!",
      data: newVoucher
    });
  } catch (error) {
    console.error("Lỗi khi tạo voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi tạo voucher", error: error.message });
  }
};

/**
 * Cập nhật voucher
 */
exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const {
      code,
      discount_type,
      discount_value,
      min_order_value,
      max_discount,
      start_date,
      end_date,
      usage_limit,
      status
    } = req.body;

    const existing = await prisma.vouchers.findUnique({
      where: { voucher_id: Number(id) }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher!" });
    }

    // Kiểm tra quyền sửa
    if (user && user.role !== 2 && user.roleName !== 'admin') {
      if (!existing.hotel_id) {
        return res.status(403).json({ success: false, message: "Bạn không có quyền sửa Voucher toàn hệ thống!" });
      }
      const hotel = await prisma.hotels.findUnique({ where: { hotel_id: existing.hotel_id } });
      if (!hotel || Number(hotel.owner_id) !== Number(user.user_id)) {
        return res.status(403).json({ success: false, message: "Bạn không có quyền chỉnh sửa voucher của khách sạn này!" });
      }
    }

    const updateData = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (discount_type) updateData.discount_type = discount_type;
    if (discount_value !== undefined) updateData.discount_value = Number(discount_value);
    if (min_order_value !== undefined) updateData.min_order_value = min_order_value !== "" ? Number(min_order_value) : 0;
    if (max_discount !== undefined) updateData.max_discount = max_discount !== "" ? Number(max_discount) : null;
    if (start_date) updateData.start_date = new Date(start_date);
    if (end_date) updateData.end_date = new Date(end_date);
    if (usage_limit !== undefined) updateData.usage_limit = usage_limit !== "" ? Number(usage_limit) : 100;
    if (status !== undefined) updateData.status = Number(status);
    if (req.body.hotel_id !== undefined && req.body.hotel_id !== "") {
      const newHotelId = Number(req.body.hotel_id);
      if (newHotelId > 0) {
        if (user && user.role !== 2 && user.roleName !== 'admin') {
          const targetHotel = await prisma.hotels.findUnique({ where: { hotel_id: newHotelId } });
          if (!targetHotel || Number(targetHotel.owner_id) !== Number(user.user_id)) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền chuyển voucher sang khách sạn này!" });
          }
        }
        updateData.hotel_id = newHotelId;
      } else if (user && (user.role === 2 || user.roleName === 'admin')) {
        updateData.hotel_id = null;
      }
    }

    const updated = await prisma.vouchers.update({
      where: { voucher_id: Number(id) },
      data: updateData,
      include: {
        hotels: { select: { hotel_id: true, hotel_name: true } }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật voucher thành công!",
      data: updated
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật voucher", error: error.message });
  }
};

/**
 * Xóa voucher
 */
exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const existing = await prisma.vouchers.findUnique({
      where: { voucher_id: Number(id) }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher!" });
    }

    // Kiểm tra quyền xóa
    if (user && user.role !== 2 && user.roleName !== 'admin') {
      if (!existing.hotel_id) {
        return res.status(403).json({ success: false, message: "Bạn không có quyền xóa Voucher toàn hệ thống!" });
      }
      const hotel = await prisma.hotels.findUnique({ where: { hotel_id: existing.hotel_id } });
      if (!hotel || Number(hotel.owner_id) !== Number(user.user_id)) {
        return res.status(403).json({ success: false, message: "Bạn không có quyền xóa voucher của khách sạn này!" });
      }
    }

    await prisma.vouchers.delete({
      where: { voucher_id: Number(id) }
    });

    return res.status(200).json({
      success: true,
      message: "Xóa voucher thành công!"
    });
  } catch (error) {
    console.error("Lỗi khi xóa voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi xóa voucher", error: error.message });
  }
};

/**
 * Áp dụng voucher (dùng tại Checkout)
 */
exports.applyVoucher = async (req, res) => {
  try {
    const { code, order_value, hotel_id } = req.body;

    if (!code || !order_value) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập mã voucher và giá trị đơn hàng!" });
    }

    const cleanCode = code.trim().toUpperCase();
    const voucher = await prisma.vouchers.findUnique({
      where: { code: cleanCode },
      include: {
        hotels: { select: { hotel_name: true } }
      }
    });

    if (!voucher) {
      return res.status(404).json({ success: false, message: `Mã voucher '${cleanCode}' không tồn tại!` });
    }

    if (voucher.status !== 1) {
      return res.status(400).json({ success: false, message: "Mã voucher hiện đang bị tạm khóa!" });
    }

    const now = new Date();
    if (voucher.start_date && new Date(voucher.start_date) > now) {
      return res.status(400).json({ success: false, message: "Mã voucher chưa đến thời gian áp dụng!" });
    }

    if (new Date(voucher.end_date) < now) {
      return res.status(400).json({ success: false, message: "Mã voucher đã hết hạn sử dụng!" });
    }

    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ success: false, message: "Mã voucher đã được sử dụng hết số lượt tối đa!" });
    }

    if (voucher.hotel_id && Number(voucher.hotel_id) > 0) {
      if (Number(voucher.hotel_id) !== Number(hotel_id)) {
        const hotelName = voucher.hotels?.hotel_name || "Khách sạn khác";
        return res.status(400).json({ success: false, message: `Mã voucher '${cleanCode}' chỉ áp dụng riêng cho đặt phòng tại ${hotelName}!` });
      }
    }

    const orderVal = Number(order_value);
    const minOrder = Number(voucher.min_order_value || 0);
    if (orderVal < minOrder) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng cần đạt tối thiểu ${minOrder.toLocaleString('vi-VN')} VNĐ để áp dụng mã ưu đãi này!`
      });
    }

    let discountAmount = 0;
    if (voucher.discount_type === 'PERCENT') {
      discountAmount = (orderVal * Number(voucher.discount_value)) / 100;
      if (voucher.max_discount && discountAmount > Number(voucher.max_discount)) {
        discountAmount = Number(voucher.max_discount);
      }
    } else {
      // FIXED
      discountAmount = Number(voucher.discount_value);
    }

    if (discountAmount > orderVal) {
      discountAmount = orderVal;
    }

    const finalPrice = orderVal - discountAmount;

    return res.status(200).json({
      success: true,
      message: "Áp dụng mã ưu đãi thành công!",
      data: {
        voucher_id: voucher.voucher_id,
        code: voucher.code,
        discount_type: voucher.discount_type,
        discount_value: Number(voucher.discount_value),
        discount_amount: discountAmount,
        original_price: orderVal,
        final_price: finalPrice
      }
    });
  } catch (error) {
    console.error("Lỗi khi áp dụng voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi xử lý mã giảm giá", error: error.message });
  }
};
