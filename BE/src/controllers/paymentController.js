const { Decimal } = require("@prisma/client/runtime/client");
const prisma = require("../configs/database");

const getPaymentByBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const bookingExists = await prisma.bookings.findUnique({
      where: { booking_id: Number(id) },
    });

    if (!bookingExists) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin đặt phòng (Booking) này",
      });
    }

    // 3. Tiến hành lấy danh sách thanh toán của Booking đó
    const getPayment = await prisma.payments.findMany({
      where: {
        booking_id: Number(id),
      },
      select: {
        payment_id: true,
        booking_id: true,
        amount: true,
        payment_method: true,
        transaction_code: true,
        status: true,
        paid_at: true,

        bookings: {
          select: {
            total_price: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Lấy thông tin thanh toán của hóa đơn thành công",
      results: getPayment.length,
      data: getPayment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message,
    });
  }
};
const createPayment = async (req, res) => {
  try {
    const { booking_id, amount, payment_method, transaction_code, status } = req.body;

    // 1. ĐÃ SỬA: Kiểm tra xem mã Booking có tồn tại THẬT bên bảng bookings hay không
    const bookingExists = await prisma.bookings.findUnique({
      where: {
        booking_id: Number(booking_id),
      },
    });

    // Nếu không tìm thấy hóa đơn đặt phòng thì dừng lại ngay
    if (!bookingExists) {
      return res.status(404).json({
        message: "Không tìm thấy mã đặt phòng (Booking ID) này trên hệ thống.",
      });
    }

    // 2. Tiến hành tạo bản ghi thanh toán mới
    const newPayment = await prisma.payments.create({
      data: {
        booking_id: Number(booking_id),
        
        // ĐÃ SỬA: Ép kiểu về Number, Prisma sẽ tự chuyển sang Decimal dưới DB PostgreSQL
        amount: Number(amount), 
        
        payment_method: payment_method ? String(payment_method) : undefined,
        
        // Tránh bị biến thành chuỗi "undefined" nếu client không truyền
        transaction_code: transaction_code ? String(transaction_code) : null, 
        
        status: status !== undefined ? Number(status) : 0, // Mặc định là 0 (Chờ xử lý)
      },
      include: {
        bookings: {
          select: {
            room_id: true,
            guest_count: true,
            check_in: true,
            check_out: true,
            total_price: true,
            status: true,
          },
        },
      },
    });

    // 3. Trả về cấu trúc JSON bọc đẹp đẽ
    return res.status(201).json({
      message: "Tạo lịch sử thanh toán thành công!",
      data: newPayment
    });

  } catch (error) {
    return res.status(500).json({ 
      message: "Lỗi server: " + error.message 
    });
  }
};

module.exports = { getPaymentByBooking, createPayment  };
