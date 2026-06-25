const prisma = require("../configs/database");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const getAllUsers = async (req, res) => {
  try {

    const rawUsers = await prisma.users.findMany({
      select: {
        user_id : true,
        full_name : true,
        email: true,
        phone : true,
        role : true,
        created_at: true,
      },
    });

    // Ánh xạ lại trường để FE dùng `fullName` và `createdAt`
    const users = rawUsers.map((u) => ({
      id: u.user_id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.created_at,
    }));

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};
const createUser = async (req, res) => {
  try {
    const { fullName, email, phone, role } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ message: "Thiếu tên hoặc email" });
    }
    // Khi Admin tạo user, dùng password mặc định nếu không có
    const defaultPassword = "123456";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const newUser = await prisma.users.create({
      data: { full_name: fullName, email, phone, role: role || 0, password: hashedPassword },
    });
    res.status(201).json({
        id: newUser.user_id,
        fullName: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.created_at,
    });
  } catch (e) {
    res.status(500).json({ message: "Lỗi Server: " + e.message });
  }
};

// Hàm đăng ký cho người dùng thường (có password riêng)
const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu." });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email này đã được sử dụng. Vui lòng dùng email khác." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: {
        full_name: fullName,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: 0, // Mặc định là customer
      },
    });

    return res.status(201).json({
      message: "Tạo tài khoản thành công!",
      user: {
        id: newUser.user_id,
        fullName: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (e) {
    res.status(500).json({ message: "Lỗi Server: " + e.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const getUser = await prisma.users.findUnique({
      where: { user_id: Number(id) },
    });

    if (!getUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    res.status(200).json({
      id: getUser.user_id,
      fullName: getUser.full_name,
      email: getUser.email,
      phone: getUser.phone,
      role: getUser.role,
      createdAt: getUser.created_at,
    });
  } catch (e) {
    res.status(500).json({ message: "Lỗi Server: " + e.message });
  }
};

const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { user_id: Number(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const updatedUser = await prisma.users.update({
      where: { user_id: Number(id) },
      data: { full_name: fullName, email, phone, role },
    });

    res.status(200).json({
      id: updatedUser.user_id,
      fullName: updatedUser.full_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      createdAt: updatedUser.created_at,
    });
  } catch (e) {
    res.status(500).json({ message: "Lỗi Server: " + e.message });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    // 1. Kiểm tra xem Người dùng có tồn tại trong hệ thống không trước khi xóa
    const existingUser = await prisma.users.findUnique({
      where: { user_id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng này" });
    }

    // 2. Chạy Prisma Transaction để thực hiện dọn dẹp dây chuyền (Cascade Delete) thủ công
    await prisma.$transaction(async (tx) => {
      
      // ====================================================================
      // BƯỚC A: DỌN DẸP DỮ LIỆU DO CHÍNH USER NÀY TẠO RA KHI ĐI ĐẶT PHÒNG / ĐÁNH GIÁ ĐỒNG NGHIỆP
      // ====================================================================
      
      // A1. Xóa tất cả đánh giá (reviews) do chính User này viết
      await tx.reviews.deleteMany({ 
        where: { user_id: userId } 
      });

      // A2. Xóa tất cả hóa đơn (payments) cho các lượt đặt phòng của chính User này
      await tx.payments.deleteMany({
        where: { bookings: { user_id: userId } }
      });

      // A3. Xóa tất cả các lượt đặt phòng (bookings) của chính User này
      await tx.bookings.deleteMany({ 
        where: { user_id: userId } 
      });


      // ====================================================================
      // BƯỚC B: DỌN DẸP DỮ LIỆU CỦA KHÁCH HÀNG VÃNG LAI DÍNH VÀO KHÁCH SẠN CỦA USER NÀY
      // ====================================================================
      
      // B1. Tìm danh sách tất cả ID khách sạn do User này sở hữu (owner_id)
      const userHotels = await tx.hotels.findMany({
        where: { owner_id: userId },
        select: { hotel_id: true }
      });
      
      const hotelIds = userHotels.map(h => h.hotel_id);

      // Nếu User này có làm chủ khách sạn, ta tiến hành bóc tách dọn dẹp sâu bên trong
      if (hotelIds.length > 0) {
        
        // B2. Xóa sạch tất cả ảnh của các khách sạn này
        await tx.hotel_images.deleteMany({ 
          where: { hotel_id: { in: hotelIds } } 
        });
        
        // B3. Xóa sạch tất cả ảnh của các phòng nằm trong các khách sạn này
        // Phải đi nhờ qua bảng rooms
        await tx.room_images.deleteMany({ 
          where: { rooms: { hotel_id: { in: hotelIds } } } 
        });
        
        // B4. Xóa các khoản thanh toán (payments) của KHÁCH HÀNG KHÁC trả cho khách sạn này
        await tx.payments.deleteMany({
          where: { bookings: { rooms: { hotel_id: { in: hotelIds } } } }
        });

        // B5. Xóa các lượt đặt phòng (bookings) của KHÁCH HÀNG KHÁC tại khách sạn này
        await tx.bookings.deleteMany({ 
          where: { rooms: { hotel_id: { in: hotelIds } } } 
        });
        
        // B6. Xóa tất cả các phòng (rooms) thuộc các khách sạn này
        await tx.rooms.deleteMany({ 
          where: { hotel_id: { in: hotelIds } } 
        });
        
        // B7. Xóa sạch tất cả đánh giá (reviews) của BẤT KỲ AI viết cho các khách sạn này
        await tx.reviews.deleteMany({
          where: { hotel_id: { in: hotelIds } }
        });
        
        // B8. Xóa chính các khách sạn do User này làm chủ
        await tx.hotels.deleteMany({ 
          where: { owner_id: userId } 
        });
      }

      // ====================================================================
      // BƯỚC C: KHÔNG CÒN RÀNG BUỘC - TIẾN HÀNH XÓA CỨNG USER
      // ====================================================================
      await tx.users.delete({
        where: { user_id: userId }
      });
    });

    // Trả về kết quả thành công rực rỡ
    return res.status(200).json({ 
      message: "Xóa cứng Người dùng và toàn bộ dữ liệu liên quan thành công vĩnh viễn!" 
    });

  } catch (error) {
    // Luôn luôn dùng dấu chấm .json để tránh crash server bạn nhé
    return res.status(500).json({ 
      message: "Lỗi server khi thực hiện Hard Delete: " + error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ email và mật khẩu."
      });
    }

    const checkMail = await prisma.users.findUnique({
      where: { email }
    });

    if (!checkMail) {
      return res.status(404).json({
        message: "Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại."
      });
    }

    if (!checkMail.password) {
      return res.status(500).json({
        message: "Tài khoản này chưa có mật khẩu. Vui lòng liên hệ admin."
      });
    }

    const checkPass = await bcrypt.compare(password, checkMail.password);

    if (!checkPass) {
      return res.status(400).json({
        message: "Mật khẩu không đúng. Vui lòng thử lại."
      });
    }

    const token = jwt.sign(
      {
        user_id: checkMail.user_id,
        email: checkMail.email,
        role: checkMail.role
      },
      process.env.SECRET_KEY || 'abc123',
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      users: {
        user_id: checkMail.user_id,
        full_name: checkMail.full_name,
        email: checkMail.email,
        role: checkMail.role,
        phone: checkMail.phone
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  register,
  getUserById,
  updateUserById,
  deleteUserById,
  login
};
