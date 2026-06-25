const jwt = require('jsonwebtoken');

// Ánh xạ giữa giá trị lưu trong Database (Integer) và Tên Quyền (String) để lập trình viên sử dụng linh hoạt
const ROLE_MAP = {
  0: 'customer',
  1: 'hotel own',
  2: 'admin',
  'customer': 0,
  'hotel own': 1,
  'admin': 2
};

/**
 * Middleware Xác Thực (Authentication)
 * Kiểm tra xem request có gửi kèm Access Token hợp lệ không.
 * Hỗ trợ lấy token từ header "Authorization: Bearer <token>" hoặc "x-access-token".
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy Access Token. Vui lòng đăng nhập lại.'
      });
    }

    const secretKey = process.env.SECRET_KEY || 'abc123';

    // Xác thực token
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token đã hết hạn. Vui lòng đăng nhập lại.'
          });
        }
        return res.status(401).json({
          success: false,
          message: 'Token không hợp lệ hoặc đã bị sửa đổi.'
        });
      }

      // Lưu trữ thông tin đã giải mã (user_id, email, role) vào req.user để các middleware/controller tiếp theo sử dụng
      req.user = decoded;
      next();
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi hệ thống trong quá trình xác thực.',
      error: error.message
    });
  }
};

/**
 * Middleware Phân Quyền (Authorization)
 * Kiểm tra xem Role của người dùng (trong req.user.role) có thuộc danh sách các Role được phép hay không.
 * Hỗ trợ cả hai dạng: string ('admin', 'hotel own', 'customer') và number (0, 1, 2) theo Database.
 * @param {Array<string|number>|string|number} allowedRoles - Danh sách các Role được phép truy cập route
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Đảm bảo allowedRoles luôn là một mảng để dễ xử lý
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Đảm bảo request đã chạy qua middleware authenticate trước đó và có thông tin user
      if (!req.user || req.user.role === undefined) {
        return res.status(401).json({
          success: false,
          message: 'Yêu cầu chưa được xác thực. Không thể phân quyền.'
        });
      }

      // Kiểm tra xem role của user có nằm trong danh sách được phép không (hỗ trợ so khớp chéo số/chuỗi)
      const hasPermission = roles.some(allowedRole => {
        // So sánh trực tiếp (ví dụ: cùng là số 2 hoặc cùng là 'admin')
        if (req.user.role === allowedRole) return true;
        // So sánh qua ánh xạ map (ví dụ: DB lưu 2 nhưng route yêu cầu 'admin')
        if (ROLE_MAP[req.user.role] === allowedRole) return true;
        if (ROLE_MAP[allowedRole] === req.user.role) return true;
        return false;
      });

      if (!hasPermission) {
        // Lấy ra tên quyền thân thiện để thông báo
        const currentRoleName = ROLE_MAP[req.user.role] || req.user.role;
        return res.status(403).json({
          success: false,
          message: `Truy cập bị từ chối. Tài khoản của bạn với vai trò '${currentRoleName}' không có quyền thực hiện chức năng này.`
        });
      }

      // Hợp lệ, chuyển tiếp sang controller/middleware tiếp theo
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi hệ thống trong quá trình phân quyền.',
        error: error.message
      });
    }
  };
};

module.exports = {
  authenticate,
  checkRole
};
