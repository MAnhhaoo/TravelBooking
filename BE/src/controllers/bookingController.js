const prisma = require("../configs/database");

const createBooking = async (req, res) => {
  try {
    const {
      room_id,
      guest_count,
      check_in,
      check_out,
      total_price,
      status,
    } = req.body;

    // Lấy user_id từ token đã xác thực hoặc fallback req.body
    const user_id = req.user ? req.user.user_id : req.body.user_id;

    const checkUser = await prisma.users.findUnique({
      where: {
        user_id: Number(user_id),
      },
    });
    const checkRoom = await prisma.rooms.findUnique({
      where: {
        room_id: Number(room_id),
      },
    });
    if (!checkRoom || !checkUser) {
      return res.status(404).json({
        success: false,
        message: "room or user not found",
      });
    }

    const newBooking = await prisma.bookings.create({
      data: {
        user_id: Number(user_id),
        room_id: Number(room_id),
        guest_count: Number(guest_count),
        check_in: new Date(check_in),
        check_out: new Date(check_out),
        total_price: Number(total_price),
        status: status !== undefined ? Number(status) : 0,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Đặt phòng thành công!",
      data: newBooking
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error: " + error.message,
    });
  }
};

const updateStatusBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const VALID_STATUSES = [0, 1, 2, 3];

    if (status === undefined || !VALID_STATUSES.includes(Number(status))) {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ. Giá trị cho phép: 0 (Chờ), 1 (Đã thanh toán), 2 (Hoàn thành), 3 (Đã hủy)"
      });
    }

    const existingBooking = await prisma.bookings.findUnique({
      where: { booking_id: Number(id) }
    });
    if (!existingBooking) {
      return res.status(404).json({ message: "Không tìm thấy lượt đặt phòng này" });
    }

    const updated = await prisma.bookings.update({
      where: { booking_id: Number(id) },
      data: { status: Number(status) }
    });

    return res.status(200).json({
      message: "Cập nhật trạng thái đặt phòng thành công",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message
    });
  }
}


const getDetailBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingId = Number(id);

    const detailBooking = await prisma.bookings.findUnique({
      where: {
        booking_id: bookingId
      },
      include: {
        users: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
            phone: true
          }
        },
        rooms: {
          include: {
            hotels: {
              select: {
                hotel_id: true,
                hotel_name: true,
                address: true,
                city: true,
                phone: true,
                owner_id: true
              }
            },
            room_types: true,
            room_images: true
          }
        },
        payments: true
      }
    });

    if (!detailBooking) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin lượt đặt phòng này"
      });
    }

    // Kiểm tra bảo mật IDOR: Người đặt phòng (customer) HOẶC chủ khách sạn (owner) HOẶC admin (role 2)
    const isCustomer = req.user?.user_id === detailBooking.user_id;
    const isHotelOwner = req.user?.user_id === detailBooking.rooms?.hotels?.owner_id;
    const isAdmin = Number(req.user?.role) === 2;

    if (!isCustomer && !isHotelOwner && !isAdmin) {
      return res.status(403).json({
        message: "Bạn không có quyền xem chi tiết hóa đơn đặt phòng này"
      });
    }

    return res.status(200).json({
      message: "Lấy chi tiết lượt đặt phòng thành công",
      data: detailBooking
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message
    });
  }
};

const getAllBooking = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let whereCondition = {};
    if (req.user && Number(req.user.role) === 1) {
      whereCondition = {
        rooms: {
          hotels: {
            owner_id: req.user.user_id
          }
        }
      };
    }
    const hotelIdParam = req.query.hotel_id || req.query.hotelId;
    if (hotelIdParam && Number(hotelIdParam) > 0) {
      if (whereCondition.rooms) {
        whereCondition.rooms.hotel_id = Number(hotelIdParam);
      } else {
        whereCondition.rooms = { hotel_id: Number(hotelIdParam) };
      }
    }

    const keyword = (req.query.keyword || req.query.search || "").trim();
    if (keyword) {
      const isNum = !isNaN(Number(keyword)) && Number(keyword) > 0;
      whereCondition.OR = [
        ...(isNum ? [{ booking_id: Number(keyword) }] : []),
        { users: { full_name: { contains: keyword } } },
        { users: { email: { contains: keyword } } },
        { users: { phone: { contains: keyword } } },
        { rooms: { hotels: { hotel_name: { contains: keyword } } } },
        { rooms: { room_number: { contains: keyword } } }
      ];
    }

    const totalItems = await prisma.bookings.count({ where: whereCondition });

    const bookings = await prisma.bookings.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
            phone: true
          }
        },
        rooms: {
          include: {
            hotels: {
              select: {
                hotel_id: true,
                hotel_name: true,
                address: true,
                city: true
              }
            },
            room_types: true,
            room_images: true
          }
        },
        payments: true
      }
    });

    return res.status(200).json({
      message: "Lấy danh sách tất cả đặt phòng thành công",
      results: bookings.length,
      data: bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message
    });
  }
};

module.exports = { createBooking, updateStatusBooking, getDetailBooking, getAllBooking };
