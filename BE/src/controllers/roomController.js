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

module.exports = {
  getAllRoom,
  createRoom,
  getRoomByHotel,
  updateRoom,
  deleteRoom,
  updateStatusRoom
};
