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

const updateStatusBooking = async (req,res)=>{
  try {
    const {id} = req.params 
    const {status} = req.body
    const validateStatus = [0,1,2,3]
    if (status === undefined || !validateStatus.includes(Number(status))) {
      return res.status(404).json({
        message : "status error must 0 1 2 or 3"
      })
    }
    const updateStatus = await prisma.bookings.update({
      where : {
        booking_id : Number(id)
      },
      data :{
        status : Number(status)
      }
    })
    return res.status(200).json({
      message : "update success",
      data : updateStatus
    })
  } catch (error) {
    return res.status(500).json({
      message: "server error" + error.message
    })
  }
}
module.exports = { createBooking , updateStatusBooking};
