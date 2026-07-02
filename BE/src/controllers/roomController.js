const prisma = require("../configs/database");
const getAllRoom = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalItems = await prisma.rooms.count();

    const allRooms = await prisma.rooms.findMany({
      skip,
      take: limit,
      select: {
        room_id: true,
        hotel_id: true,
        room_type_id: true,
        room_number: true,
        price_per_night: true,
        status: true,

        // Lấy thông tin khách sạn chứa phòng này
        hotels: {
          select: {
            hotel_name: true,
            city: true,
          },
        },

        // Lấy thông tin loại phòng (để biết phòng này ở được mấy người)
        room_types: {
          select: {
            type_name: true,
            max_guest: true,
          },
        },

        // Lấy danh sách ảnh của phòng
        room_images: {
          select: {
            image_id: true,
            image_url: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Lấy danh sách tất cả phòng thành công",
      results: allRooms.length,
      data: allRooms,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message,
    });
  }
};
const createRoom = async (req, res) => {
  try {
    const { hotel_id, room_type_id, room_number, price_per_night, image, images, status } = req.body;
    const imgList = images || image;

    const [checkHotel, checkRoomType] = await Promise.all([
      prisma.hotels.findUnique({ where: { hotel_id: Number(hotel_id) } }),
      prisma.room_types.findUnique({ where: { room_type_id: Number(room_type_id) } })
    ]);

    if (!checkHotel || !checkRoomType) {
      return res.status(404).json({
        message: "Không tìm thấy khách sạn hoặc loại phòng tương ứng"
      });
    }

    const newRoom = await prisma.rooms.create({
      data: {
        hotel_id: Number(hotel_id),
        room_type_id: Number(room_type_id),
        room_number: String(room_number),
        price_per_night: Number(price_per_night),
        status: Number(status),
        room_images: {
          create: imgList && imgList.length > 0
            ? imgList.map((url) => ({ image_url: url }))
            : []
        }
      },
      include: {
        room_images: true,
        room_types: true
      }
    });

    return res.status(201).json({
      message: "Tạo phòng mới thành công",
      data: newRoom
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message
    });
  }
};

const getRoomByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalItems = await prisma.rooms.count({
      where: { hotel_id: Number(hotelId) }
    });

    const rooms = await prisma.rooms.findMany({
      where: {
        hotel_id: Number(hotelId)
      },
      skip,
      take: limit,
      // Thay thế hoàn toàn include bằng select
      select: {
        room_id: true,
        hotel_id: true,
        room_type_id: true,
        room_number: true,
        price_per_night: true,
        status: true,
        
        // Chọn các trường cụ thể của bảng room_types (bảng liên quan)
        room_types: {
          select: {
            type_name: true,
            description: true,
            max_guest: true,
            room_type_amenities: {
              include: {
                amenities: true
              }
            }
          }
        },
        
        // Chọn các trường cụ thể của bảng room_images (bảng liên quan)
        room_images: {
          select: {
            image_id: true,
            image_url: true
          }
        },

        // Lấy thông tin khách sạn
        hotels: {
          select: {
            hotel_id: true,
            hotel_name: true,
            address: true,
            city: true
          }
        }
      }
    });

    return res.status(200).json({
      message: "Lấy danh sách phòng thành công",
      results: rooms.length,
      data: rooms,
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

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      room_type_id,
      room_number,
      price_per_night,
      images,
      image,
      status 
    } = req.body;
    const imgList = images || image;

    // Kiểm tra phòng có tồn tại không
    const checkRoom = await prisma.rooms.findUnique({
      where: { room_id: Number(id) }
    });

    if (!checkRoom) {
      return res.status(404).json({
        message: "Không tìm thấy phòng với ID này"
      });
    }

    // Tiến hành cập nhật
    const roomUpdated = await prisma.rooms.update({
      where: { room_id: Number(id) },
      data: {
        room_type_id: room_type_id ? Number(room_type_id) : undefined,
        room_number: room_number ? String(room_number) : undefined,
        price_per_night: price_per_night ? Number(price_per_night) : undefined,
        status: status !== undefined ? Number(status) : undefined,
        room_images: imgList ? {
          deleteMany: {}, 
          create: imgList.map(url => ({ image_url: url }))
        } : undefined
      },
      include: {
        room_types: {
          select: {
            type_name: true,
            max_guest: true
          }
        },
        room_images: {
          select: {
            image_url: true
          }
        }
      }
    });

    // 3. Trả về dữ liệu phòng sau khi update cho client
    return res.status(200).json({
      message: "Cập nhật thông tin phòng thành công",
      data: roomUpdated
    });

  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message
    });
  }
};
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const roomId = Number(id);

    const existing = await prisma.rooms.findUnique({ where: { room_id: roomId } });
    if (!existing) {
      return res.status(404).json({ message: "Không tìm thấy phòng với ID này" });
    }

    await prisma.room_images.deleteMany({ where: { room_id: roomId } });
    await prisma.rooms.delete({ where: { room_id: roomId } });

    return res.status(200).json({ message: "Xóa phòng thành công" });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message
    });
  }
};
const updateStatusRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const VALID_STATUSES = [0, 1, 2];

    if (status === undefined || !VALID_STATUSES.includes(Number(status))) {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ (phải là 0, 1 hoặc 2)"
      });
    }

    const checkRoom = await prisma.rooms.findUnique({
      where: { room_id: Number(id) }
    });
    if (!checkRoom) {
      return res.status(404).json({
        message: "Không tìm thấy phòng với ID này"
      });
    }

    const updated = await prisma.rooms.update({
      where: { room_id: Number(id) },
      data: { status: Number(status) }
    });

    return res.status(200).json({
      message: "Cập nhật trạng thái phòng thành công",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message
    });
  }
};

/**
 * Hàm Lấy Chi Tiết 1 Phòng Theo ID
 * GET /api/rooms/getRoomById/:id
 *
 * Mục đích: Trả về đầy đủ thông tin của 1 phòng cụ thể, bao gồm:
 *   - Thông tin cơ bản (số phòng, giá, trạng thái)
 *   - Loại phòng (tên, mô tả, sức chứa)
 *   - Danh sách tiện nghi của loại phòng đó (room_type_amenities -> amenities)
 *   - Danh sách ảnh phòng (room_images)
 *   - Thông tin khách sạn chứa phòng này (hotel_name, address, city, phone)
 *
 * Kết hợp Prisma select lồng nhau (nested select) để giảm thiểu số lượng
 * câu query và tránh N+1 problem.
 */
const getRoomById = async (req, res) => {
  try {
    // Lấy roomId từ URL params, ép kiểu sang số nguyên
    const { id } = req.params;
    const roomId = Number(id);

    // Kiểm tra nếu id không phải số hợp lệ
    if (isNaN(roomId)) {
      return res.status(400).json({ message: "ID phòng không hợp lệ" });
    }

    // Truy vấn Prisma lấy phòng theo ID (findUnique = chính xác 1 bản ghi)
    const room = await prisma.rooms.findUnique({
      where: { room_id: roomId },
      select: {
        // Thông tin cơ bản của phòng
        room_id: true,
        hotel_id: true,
        room_type_id: true,
        room_number: true,
        price_per_night: true,
        status: true,

        // Thông tin loại phòng kèm tiện nghi (join 3 bảng: room_types -> room_type_amenities -> amenities)
        room_types: {
          select: {
            type_name: true,
            description: true,
            max_guest: true,
            // Lấy danh sách tiện nghi qua bảng trung gian room_type_amenities
            room_type_amenities: {
              include: {
                amenities: true  // Join vào bảng amenities để lấy tên tiện nghi
              }
            }
          }
        },

        // Danh sách tất cả ảnh của phòng này
        room_images: {
          select: {
            image_id: true,
            image_url: true
          }
        },

        // Thông tin khách sạn chứa phòng (để hiển thị breadcrumb và thông tin liên hệ)
        hotels: {
          select: {
            hotel_id: true,
            hotel_name: true,
            address: true,
            city: true,
            phone: true,
            star_rating: true,
            description: true,
            // Lấy 1 ảnh đại diện của khách sạn
            hotel_images: {
              select: { image_url: true },
              take: 1  // Chỉ lấy 1 ảnh thumbnail đầu tiên để tránh over-fetching
            }
          }
        }
      }
    });

    // Nếu không tìm thấy phòng với ID này, trả về 404
    if (!room) {
      return res.status(404).json({
        message: `Không tìm thấy phòng với ID: ${roomId}`
      });
    }

    // Trả về dữ liệu phòng thành công
    return res.status(200).json({
      message: "Lấy thông tin chi tiết phòng thành công",
      data: room
    });

  } catch (error) {
    // Bắt lỗi bất ngờ từ server/database và trả về 500
    return res.status(500).json({
      message: "Lỗi server: " + error.message
    });
  }
};

module.exports = {
  getAllRoom,
  createRoom,
  getRoomByHotel,
  getRoomById,
  updateRoom,
  deleteRoom,
  updateStatusRoom
};
