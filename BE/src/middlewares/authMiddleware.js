const jwt = require('jsonwebtoken');

// Ánh xạ role ID (số nguyên) → tên quyền (chuỗi)
const ROLE_MAP = {
  0: 'customer',
  1: 'hotel own',
  2: 'admin',
};

/**
 * Chuẩn hoá role về số nguyên để so sánh thống nhất.
 * Hỗ trợ số (0,1,2) và alias chuỗi ('admin', 'hotel own', 'owner', ...).
 * @returns {number|null}
 */
const resolveRoleId = (role) => {
  const n = Number(role);
  if (!isNaN(n) && ROLE_MAP[n] !== undefined) return n;
  const aliases = {
    customer: 0, 'hotel own': 1, owner: 1, hotel_owner: 1, vendor: 1, admin: 2,
  };
  return aliases[String(role).toLowerCase()] ?? null;
};


/**
 * Middleware Xác Thực (Authentication)
 * Hỗ trợ "Authorization: Bearer <token>" (case-insensitive) và "x-access-token".
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.slice(7);
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy Access Token. Vui lòng đăng nhập lại.',
    });
  }

  const secretKey = process.env.SECRET_KEY || 'abc123';

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Token đã hết hạn. Vui lòng đăng nhập lại.'
          : 'Token không hợp lệ hoặc đã bị sửa đổi.';
      return res.status(401).json({ success: false, message });
    }
    req.user = decoded;
    next();
  });
};


/**
 * Middleware Phân Quyền (Authorization)
 * @param {string|number|Array<string|number>} allowedRoles - Role(s) được phép truy cập
 */
const checkRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  // Tính trước tập hợp role ID được phép (O(1) lookup thay vì lặp mỗi request)
  const allowedIds = new Set(
    roles.map(resolveRoleId).filter((id) => id !== null)
  );

  return (req, res, next) => {
    if (!req.user || req.user.role == null) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu chưa được xác thực. Không thể phân quyền.',
      });
    }

    const userRoleId = resolveRoleId(req.user.role);
    if (userRoleId === null || !allowedIds.has(userRoleId)) {
      const currentRoleName = ROLE_MAP[userRoleId] ?? req.user.role;
      return res.status(403).json({
        success: false,
        message: `Truy cập bị từ chối. Vai trò '${currentRoleName}' không có quyền thực hiện chức năng này.`,
      });
    }

    next();
  };
};

module.exports = { authenticate, checkRole };

