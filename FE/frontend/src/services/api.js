import axios from "axios";

// Đặt baseURL trỏ về IP của máy hoặc localhost nơi BE đang chạy
export const api = axios.create({
    baseURL: "http://localhost:8080"
});

// Thêm Interceptor để tự động đính kèm Token vào Header (nếu có)
// Đọc từ cả localStorage (rememberMe=true) và sessionStorage (rememberMe=false)
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ==================== USER & AUTH APIs ====================
export const loginAPI = async (credentials) => {
    // Gọi thẳng BE, KHÔNG fallback giả - để đảm bảo bảo mật
    const response = await api.post("/api/users/login", credentials);
    return response.data;
};

// API Đăng ký tài khoản mới (có gửi password để BE hash và lưu DB)
export const registerAPI = async (userData) => {
    const response = await api.post("/api/users/register", userData);
    return response.data;
};

// Helper để xử lý response phân trang từ BE mà không làm gãy các component FE đang dùng mảng
const normalizePaginatedResponse = (resData, fallbackArray = []) => {
    if (!resData) return fallbackArray;
    const result = resData.data !== undefined ? resData.data : resData;
    if (Array.isArray(result)) {
        if (resData.pagination) {
            result.pagination = resData.pagination;
        }
        return result;
    }
    return fallbackArray;
};

export const getUsersAPI = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/admin/users?page=${page}&limit=${limit}`);
        return normalizePaginatedResponse(response.data);
    } catch (error) {
        console.warn("Lỗi khi lấy danh sách người dùng (sử dụng dữ liệu mẫu):", error?.message || error);
        // Fallback mock users so admin page works without crashing
        const mock = [
            { id: 1, fullName: "Quản trị viên Hệ thống", email: "admin@travelbooking.com", role: 2, status: "Hoạt động", phone: "0901234567", createdAt: new Date().toISOString() },
            { id: 2, fullName: "Nguyễn Văn Chủ", email: "owner@travelbooking.com", role: 1, status: "Hoạt động", phone: "0912345678", createdAt: new Date().toISOString() },
            { id: 3, fullName: "Khách Hàng VIP", email: "customer@travelbooking.com", role: 0, status: "Hoạt động", phone: "0923456789", createdAt: new Date().toISOString() }
        ];
        mock.pagination = { currentPage: page, totalPages: 1, totalItems: mock.length, limit };
        return mock;
    }
};

export const createUserAPI = async (userData) => {
    try {
        const response = await api.post("/api/users/createUser", userData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo người dùng (Admin):", error);
        throw error;
    }
};

// ==================== HOTEL APIs ====================
export const getHotelsAPI = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/hotels/getAllHotel?page=${page}&limit=${limit}`);
        return normalizePaginatedResponse(response.data);
    } catch (error) {
        console.warn("Lỗi khi lấy danh sách khách sạn:", error?.message || error);
        return []; // Trả về mảng rỗng để giao diện không bị lỗi map()
    }
};

// Tìm kiếm khách sạn nâng cao (endpoint mới GET /api/hotels/search)
export const searchHotelsAPI = async ({ keyword, city, stars, minPrice, maxPrice, page = 1, limit = 20 } = {}) => {
    try {
        const params = new URLSearchParams();
        if (keyword)  params.set('keyword',  keyword);
        if (city)     params.set('city',     city);
        if (stars)    params.set('stars',    stars);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        params.set('page',  page);
        params.set('limit', limit);
        const response = await api.get(`/api/hotels/search?${params.toString()}`);
        return normalizePaginatedResponse(response.data);
    } catch (error) {
        console.warn("Lỗi tìm kiếm khách sạn:", error?.message || error);
        return [];
    }
};


export const getHotelByIdAPI = async (id) => {
    try {
        const response = await api.get(`/api/hotels/getHotelById/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin khách sạn ID ${id}:`, error);
        return null;
    }
};

export const updateHotelStatusAPI = async (id, status) => {
    try {
        const response = await api.patch(`/api/hotels/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái khách sạn:", error);
        throw error;
    }
};

// ==================== ROOM APIs ====================
export const getAllRoomsAPI = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/rooms/getAllRoom?page=${page}&limit=${limit}`);
        return normalizePaginatedResponse(response.data);
    } catch (error) {
        console.warn("Lỗi khi lấy danh sách phòng:", error?.message || error);
        return [];
    }
};

export const getRoomsByHotelAPI = async (hotelId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/rooms/getRoomByHotel/${hotelId}?page=${page}&limit=${limit}`);
        return normalizePaginatedResponse(response.data);
    } catch (error) {
        console.warn(`Lỗi khi lấy danh sách phòng cho khách sạn ID ${hotelId}:`, error?.message || error);
        return [];
    }
};

// Lấy chi tiết 1 phòng theo ID (endpoint mới GET /api/rooms/getRoomById/:id)
export const getRoomByIdAPI = async (roomId) => {
    try {
        const response = await api.get(`/api/rooms/getRoomById/${roomId}`);
        return response.data;
    } catch (error) {
        console.warn(`Lỗi khi lấy chi tiết phòng ID ${roomId}:`, error?.message || error);
        return null;
    }
};

export const updateRoomStatusAPI = async (id, status) => {
    try {
        const response = await api.patch(`/api/rooms/updateStatusRoom/${id}`, { status });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái phòng:", error);
        throw error;
    }
};

export const createRoomAPI = async (roomData) => {
    try {
        const response = await api.post("/api/rooms/createRoom", roomData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo phòng mới:", error);
        throw error;
    }
};

export const updateRoomAPI = async (id, roomData) => {
    try {
        const response = await api.put(`/api/rooms/updateRoom/${id}`, roomData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật phòng:", error);
        throw error;
    }
};

// ==================== REVIEW APIs ====================
export const getReviewsByHotelAPI = async (hotelId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/reviews/getAllReviewByHotel/${hotelId}?page=${page}&limit=${limit}`);
        return normalizePaginatedResponse(response.data);
    } catch (error) {
        console.warn(`Lỗi khi lấy đánh giá cho khách sạn ID ${hotelId}:`, error?.message || error);
        return [];
    }
};

// ==================== BOOKING APIs ====================
export const createBookingAPI = async (bookingData) => {
    try {
        const response = await api.post("/api/bookings/createBooking", bookingData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo đặt phòng:", error);
        throw error;
    }
};

export const getUserBookingsAPI = async (userId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/users/getUserBookings/${userId}?page=${page}&limit=${limit}`);
        return normalizePaginatedResponse(response.data);
    } catch (error) {
        console.warn(`Lỗi khi lấy lịch sử đặt phòng user ${userId}:`, error?.message || error);
        return [];
    }
};

export const getAllBookingsAPI = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/bookings/getAllBooking?page=${page}&limit=${limit}`);
        // Trả về cả { data, pagination } thay vì chỉ mảng
        const resData = response.data;
        return {
            data: resData?.data || [],
            pagination: resData?.pagination || { currentPage: page, totalPages: 1, totalItems: 0, limit }
        };
    } catch (error) {
        console.warn("Lỗi khi lấy danh sách tất cả đặt phòng:", error?.message || error);
        return { data: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, limit } };
    }
};

export const getDetailBookingAPI = async (bookingId) => {
    try {
        const response = await api.get(`/api/bookings/getDetailBooking/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết booking ${bookingId}:`, error);
        throw error;
    }
};

export const updateStatusBookingAPI = async (id, status) => {
    try {
        const response = await api.put(`/api/bookings/updateStatusBooking/${id}`, { status });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đặt phòng:", error);
        throw error;
    }
};

// ==================== PAYMENT APIs ====================
export const createPaymentAPI = async (paymentData) => {
    try {
        const response = await api.post("/api/payments/createPayment", paymentData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xử lý thanh toán:", error);
        throw error;
    }
};

export const getPaymentByBookingAPI = async (bookingId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/payments/getPaymentByBooking/${bookingId}?page=${page}&limit=${limit}`);
        return normalizePaginatedResponse(response.data);
    } catch (error) {
        console.warn(`Lỗi khi lấy thanh toán của booking ${bookingId}:`, error?.message || error);
        return [];
    }
};

export const getAllPaymentsAPI = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/payments/getAllPayment?page=${page}&limit=${limit}`);
        return normalizePaginatedResponse(response.data);
    } catch (error) {
        console.warn("Lỗi khi lấy danh sách tất cả thanh toán:", error?.message || error);
        return [];
    }
};

// ==================== STATS APIs ====================
/**
 * @param {Object} params - { period: 'day'|'week'|'month'|'year', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
 */
export const getOwnerStatsAPI = async (params = {}) => {
    try {
        const qs = new URLSearchParams();
        if (params.period) qs.set('period', params.period);
        if (params.startDate) qs.set('startDate', params.startDate);
        if (params.endDate) qs.set('endDate', params.endDate);
        const response = await api.get(`/api/owner/stats?${qs.toString()}`);
        return response.data?.data || null;
    } catch (error) {
        console.warn("Lỗi lấy thống kê Owner stats API:", error?.message || error);
        return null;
    }
};

/**
 * @param {Object} params - { period: 'day'|'week'|'month'|'year', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
 */
export const getAdminStatsAPI = async (params = {}) => {
    try {
        const qs = new URLSearchParams();
        if (params.period) qs.set('period', params.period);
        if (params.startDate) qs.set('startDate', params.startDate);
        if (params.endDate) qs.set('endDate', params.endDate);
        const response = await api.get(`/api/admin/stats?${qs.toString()}`);
        return response.data?.data || null;
    } catch (error) {
        console.warn("Lỗi lấy thống kê Admin stats API:", error?.message || error);
        return null;
    }
};