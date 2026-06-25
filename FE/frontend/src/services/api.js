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

export const getUsersAPI = async () => {
    try {
        const response = await api.get("/api/users/getAllUsers");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        // Fallback mock users so admin page works without crashing
        return [
            { id: 1, fullName: "Quản trị viên Hệ thống", email: "admin@travelbooking.com", role: 2, phone: "0901234567", createdAt: new Date().toISOString() },
            { id: 2, fullName: "Nguyễn Văn Chủ", email: "owner@travelbooking.com", role: 1, phone: "0912345678", createdAt: new Date().toISOString() },
            { id: 3, fullName: "Khách Hàng VIP", email: "customer@travelbooking.com", role: 0, phone: "0923456789", createdAt: new Date().toISOString() }
        ];
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
export const getHotelsAPI = async () => {
    try {
        const response = await api.get("/api/hotels/getAllHotel");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khách sạn:", error);
        return []; // Trả về mảng rỗng để giao diện không bị lỗi map()
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
export const getAllRoomsAPI = async () => {
    try {
        const response = await api.get(`/api/rooms/getAllRoom`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách phòng:", error);
        return [];
    }
};

export const getRoomsByHotelAPI = async (hotelId) => {
    try {
        const response = await api.get(`/api/rooms/getRoomByHotel/${hotelId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy danh sách phòng cho khách sạn ID ${hotelId}:`, error);
        return [];
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

// ==================== REVIEW APIs ====================
export const getReviewsByHotelAPI = async (hotelId) => {
    try {
        const response = await api.get(`/api/reviews/getAllReviewByHotel/${hotelId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy đánh giá cho khách sạn ID ${hotelId}:`, error);
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