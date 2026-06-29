const { json } = require("express");
const prisma = require("../configs/database");

// 1. Hàm Lấy Tất Cả Khách Sạn (Kèm Ảnh)
const getAllHotel = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalItems = await prisma.hotels.count();

    const AllHotel = await prisma.hotels.findMany({
      skip,
      take: limit,
      select: {
        hotel_id: true,
        owner_id: true,
        hotel_name: true,
        phone: true,
        address: true,
        city: true,
        description: true,
        star_rating: true,
        status: true,
        created_at: true,
        hotel_images: {
          select: {
            image_id: true,
            image_url: true
          }
        },
        reviews: {
          select: { rating: true }
        },
        rooms: {
          select: {
            room_id: true,
            price_per_night: true,
            status: true
          }
        }
      },
    });

    return res.status(200).json({
      message: "Lấy danh sách khách sạn thành công",
      results: AllHotel.length,
      data: AllHotel,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// 2. Hàm Lấy Chi Tiết Khách Sạn Theo ID (Kèm Ảnh)
const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;

    const hotelById = await prisma.hotels.findUnique({
      where: { hotel_id: Number(id) },
      select: {
        hotel_id: true,
        owner_id: true,
        hotel_name: true,
        phone: true,
        address: true,
        city: true,
        description: true,
        star_rating: true,
        status: true,
        created_at: true,
        hotel_images: {
          select: {
            image_id: true,
            image_url: true
          }
        }
      }
    });

    if (!hotelById) {
      return res.status(404).json({ message: "Không tìm thấy khách sạn này" });
    }

    return res.status(200).json(hotelById);

  } catch (error) {
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// 3. Hàm Tạo Mới Khách Sạn (Nối bảng lưu luôn danh sách ảnh)
const createHotel = async (req, res) => {
  try {
    const {
      owner_id,
      hotel_name,
      phone,
      address,
      city,
      description,
      star_rating,
      status,
      images // Mảng string nhận từ client, ví dụ: ["url1.jpg", "url2.jpg"]
    } = req.body;

    // Kiểm tra dữ liệu bắt buộc đầu vào
    if (!owner_id || !hotel_name || !address) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc: owner_id, hotel_name, address" });
    }

    // Kiểm tra xem chủ khách sạn (owner_id) có tồn tại bên bảng users không
    // Chú ý: Đổi trường 'id' thành 'user_id' nếu file schema.prisma của bạn định nghĩa là user_id
    const existingUser = await prisma.users.findUnique({
      where: { user_id: Number(owner_id) },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Tài khoản owner_id không tồn tại trong hệ thống" });
    }

    // Tiến hành tạo khách sạn và chèn các dòng ảnh tương ứng thông qua lệnh 'create' lồng nhau
    const newHotel = await prisma.hotels.create({
      data: {
        owner_id: Number(owner_id),
        hotel_name,
        phone,
        address,
        city,
        description,
        star_rating: star_rating ? Number(star_rating) : null,
        status: status ? Number(status) : 0,

        // Sử dụng Prisma Relation để chèn dữ liệu tự động nối khóa ngoại sang bảng hotel_images
        hotel_images: {
          create: images && images.length > 0 ? images.map(url => ({ image_url: url })) : []
        }
      },
      // Trả ra kèm thông tin ảnh vừa tạo để client kiểm tra luôn
      include: {
        hotel_images: true
      }
    });

    return res.status(201).json({
      message: "Tạo khách sạn mới thành công!",
      data: newHotel
    });

  } catch (error) {
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    // BƯỚC 1: Xóa tất cả ảnh liên quan đến khách sạn này trước (Bắt buộc dùng deleteMany)
    await prisma.hotel_images.deleteMany({
      where: { hotel_id: Number(id) }
    });

    // BƯỚC 2: Ảnh sạch rồi thì mới tiến hành xóa khách sạn (Dùng delete)
    await prisma.hotels.delete({
      where: { hotel_id: Number(id) }
    });

    return res.status(200).json({
      message: "success"
    });

  } catch (error) {
    // Nhớ sửa dấu CHẤM .json ở đây nhé (code cũ của bạn đang bị dấu phẩy)
    return res.status(500).json({
      message: "server error: " + error.message
    });
  }
};

const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. PHẢI LẤY DỮ LIỆU MỚI TỪ REQ.BODY
    const { hotel_name, hotel_images, phone, address, city, description } = req.body;

    // 2. Kiểm tra xem khách sạn có tồn tại không
    const hotel = await prisma.hotels.findUnique({
      where: {
        hotel_id: Number(id)
      }
    });

    if (!hotel) {
      return res.status(404).json({
        message: "Không tìm thấy khách sạn với ID này"
      });
    }

    // 3. Cập nhật dữ liệu
    const hotelUpdated = await prisma.hotels.update({
      where: { hotel_id: Number(id) },
      data: {
        // Sử dụng Shorthand property (ví dụ: hotel_name: hotel_name)
        hotel_name,
        hotel_images,
        phone,
        address,
        city,
        description
      }
    });

    return res.status(200).json({
      message: "Cập nhật thành công",
      data: hotelUpdated
    });

  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message
    });
  }
};
const updateStatusHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validationStatus = [0, 1, 2, 3];
    if (status === undefined || !validationStatus.includes(Number(status))) {
      return res.status(401).json({
        message: "error status"
      })
    }

    const checkIdHotel = await prisma.hotels.findUnique({
      where: {
        hotel_id: Number(id)
      }
    })
    if (!checkIdHotel) {
      return res.status(401).json({
        message: "don't have hotel"
      })
    }

    const StatusUpdated = await prisma.hotels.update({
      where: {
        hotel_id: Number(id)
      },
      data: {
        status: Number(status)
      }
    })

    return res.status(200).json({
      message: "success",
      data: StatusUpdated
    })


  } catch (error) {
    return res.status(500).json({
      message: "server error" + error.message
    })
  }
}
module.exports = {
  getAllHotel,
  getHotelById,
  createHotel, // Nhớ export hàm mới ra ngoài
  deleteHotel,
  updateHotel,
  updateStatusHotel
};