const prisma = require("../configs/database");
const getAllRoom = async (req, res) => {
  try {
    const allRooms = await prisma.rooms.findMany({
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
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message,
    });
  }
};
const createRoom = async (req, res) => {
  try {
    const {
      hotel_id,
      room_type_id,
      room_number,
      price_per_night,
      image,
      status,
    } = req.body;

    const checkHotel = await prisma.hotels.findUnique({
      where: {
        hotel_id: Number(hotel_id),
      },
    });
    const checkRoomType = await prisma.room_types.findUnique({
      where: {
        room_type_id: Number(room_type_id),
      },
    });
    if (!checkHotel || !checkRoomType) {
      return res.status(401).json({
        message: "don't find room type or hotel",
      });
    }
    const newRoom = await prisma.rooms.create({
      data: {
        hotel_id: Number(hotel_id),
        room_type_id: Number(room_type_id),
        room_number: Number(room_number),
        price_per_night: Number(price_per_night),
        status: Number(status),
        room_images: {
          create:
            image && image.length > 0
              ? image.map((url) => ({
                  image_url: url,
                }))
              : [],
        },
      },
      include : {
        room_images : true ,
        room_types : true
      }
    });
    return res.status(200).json(newRoom);
  } catch (error) {
    return res.status(500).json({
      message: "server error" + error.message,
    });
  }
};

const getRoomByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const rooms = await prisma.rooms.findMany({
      where: {
        hotel_id: Number(hotelId)
      },
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
            max_guest: true
          }
        },
        
        // Chọn các trường cụ thể của bảng room_images (bảng liên quan)
        room_images: {
          select: {
            image_id: true,
            image_url: true
          }
        }
      }
    });

    return res.status(200).json({
      message: "Lấy danh sách phòng thành công",
      data: rooms
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
      images, // 1. Đổi thành số nhiều cho đúng bản chất mảng ảnh
      status 
    } = req.body;

    // Kiểm tra phòng có tồn tại không
    const checkRoom = await prisma.rooms.findUnique({
      where: { room_id: Number(id) }
    });

    if (!checkRoom) {
      return res.status(404).json({ // Nên để 404 (Not Found) thay vì 401
        message: "Không tìm thấy phòng với ID này"
      });
    }

    // Tiến hành cập nhật
    const roomUpdated = await prisma.rooms.update({
      where: { room_id: Number(id) },
      data: {
        // Đưa room_type_id vào để nếu admin muốn đổi loại phòng thì vẫn đổi được
        room_type_id: room_type_id ? Number(room_type_id) : undefined,
        
        // Giữ nguyên kiểu String cho room_number để tránh lỗi khi số phòng có ký tự chữ
        room_number: room_number ? String(room_number) : undefined,
        
        price_per_night: price_per_night ? Number(price_per_night) : undefined,
        
        status: status !== undefined ? Number(status) : undefined,
        
        // 2. Xử lý cập nhật ảnh (Đã sửa từ image thành images)
        room_images: images ? {
          deleteMany: {}, 
          create: images.map(url => ({ image_url: url }))
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
const 
  deleteRoom = async (req, res) => {
    try {
      const {id} = req.params
// xóa ảnh của phòng 
      await prisma.room_images.deleteMany({
        where : {
          room_id : Number(id)
        }
      })

      // xóa phòng
      await prisma.rooms.delete({
        where: {
          room_id : Number(id)
        }
      })

      return res.status(200).json({
        message : "delete success"
      })
    } catch (error) {
      return res.status(500).json({
        message : "server error" + error.message
      })
    }
  }
  const updateStatusRoom = async (req , res) => {
    try {
      const {id} = req.params;
      const {status} = req.body;
      const validateStatus = [0 , 1 , 2];
      if(status === undefined || !validateStatus.includes(Number(status))){
        return res.status(400).json({
          message: "Trạng thái không hợp lệ (phải là 0, 1 hoặc 2)"
        });
      }
      
      const checkRoom = await prisma.rooms.findUnique({
        where: {
          room_id: Number(id)
        }
      });
      if(!checkRoom){
        return res.status(404).json({
          message: "Không tìm thấy phòng với ID này"
        });
      }

      const StatusUpdated = await prisma.rooms.update({
        where: {
          room_id: Number(id)
        },
        data: {
          status: Number(status)
        }
      });
      return res.status(200).json({
        message: "Cập nhật trạng thái phòng thành công",
        data: StatusUpdated
      });
    } catch (error) {
      return res.status(500).json({
        message: "server error: " + error.message
      });
    }
  };
module.exports = {
  getAllRoom,
  createRoom,
  getRoomByHotel,
  updateRoom , 
  deleteRoom ,
  updateStatusRoom

};





