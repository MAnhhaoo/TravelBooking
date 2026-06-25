# 🏨 TravelBooking — Hệ thống Đặt phòng Khách sạn

> Ứng dụng web đặt phòng khách sạn cao cấp với giao diện Premium Dark Theme, xây dựng bằng **Next.js 16** + **Express.js** + **PostgreSQL (Prisma ORM)**.

---

## 📋 Mục lục

1. [Tổng quan kiến trúc](#-tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
3. [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
4. [Hướng dẫn Setup từ con số 0](#-hướng-dẫn-setup-từ-con-số-0)
   - [Bước 1: Cài đặt công cụ cần thiết](#bước-1-cài-đặt-công-cụ-cần-thiết)
   - [Bước 2: Clone / Tạo thư mục dự án](#bước-2-clone--tạo-thư-mục-dự-án)
   - [Bước 3: Setup Database PostgreSQL](#bước-3-setup-database-postgresql)
   - [Bước 4: Setup Backend (Express.js)](#bước-4-setup-backend-expressjs)
   - [Bước 5: Setup Frontend (Next.js)](#bước-5-setup-frontend-nextjs)
   - [Bước 6: Chạy ứng dụng](#bước-6-chạy-ứng-dụng)
5. [Danh sách thư viện](#-danh-sách-thư-viện)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Ghi chú thiết kế UI/UX](#-ghi-chú-thiết-kế-uiux)

---

## 🏗 Tổng quan kiến trúc

```
┌─────────────┐     HTTP/REST     ┌──────────────┐    Prisma ORM    ┌──────────────┐
│   FRONTEND  │ ◄──────────────► │   BACKEND    │ ◄──────────────► │  PostgreSQL  │
│  Next.js 16 │   localhost:3000  │  Express.js  │   localhost:5433 │   Database   │
│  Port: 3000 │    → Port: 8080  │  Port: 8080  │                  │  project_db  │
└─────────────┘                   └──────────────┘                  └──────────────┘
     │                                  │
     ├── TailwindCSS 4                  ├── Prisma 7 (ORM)
     ├── Redux Toolkit                  ├── Swagger (API Docs)
     ├── Framer Motion                  ├── JWT (Auth)
     └── Axios                          └── Bcrypt (Password)
```

---

## 📁 Cấu trúc thư mục

```
Project/
├── BE/                                  # 🔵 BACKEND (Express.js)
│   ├── .env                             # Biến môi trường (DB URL, PORT, SECRET_KEY)
│   ├── .gitignore
│   ├── package.json
│   ├── prisma.config.ts                 # Cấu hình Prisma
│   ├── prisma/
│   │   └── schema.prisma               # ⭐ Schema Database (Models)
│   └── src/
│       ├── app.js                       # ⭐ Entry point — khởi tạo Express Server
│       ├── configs/
│       │   └── database.js              # Khởi tạo PrismaClient kết nối DB
│       ├── controllers/                 # Xử lý logic nghiệp vụ
│       │   ├── userController.js
│       │   ├── hotelController.js       # CRUD Khách sạn
│       │   ├── roomController.js        # CRUD Phòng
│       │   ├── bookingController.js     # Đặt phòng
│       │   ├── reviewController.js      # Đánh giá
│       │   └── paymentController.js     # Thanh toán
│       └── routes/                      # Định tuyến API + Swagger docs
│           ├── userRoutes.js
│           ├── hotelRoutes.js
│           ├── roomRoutes.js
│           ├── bookingRoutes.js
│           ├── reviewRoutes.js
│           └── paymentRoutes.js
│
├── FE/                                  # 🟢 FRONTEND (Next.js)
│   └── frontend/
│       ├── package.json
│       ├── next.config.ts               # Cấu hình Next.js (images, etc.)
│       ├── tsconfig.json
│       ├── postcss.config.mjs           # PostCSS cho TailwindCSS
│       ├── public/                      # Tài nguyên tĩnh (favicon, images)
│       └── src/
│           ├── app/
│           │   ├── globals.css          # ⭐ CSS toàn cục (skeleton, scrollbar, theme)
│           │   ├── layout.tsx           # Root Layout (fonts, ReduxProvider)
│           │   ├── login/               # Trang đăng nhập
│           │   ├── register/            # Trang đăng ký
│           │   └── (user-layout)/       # ⭐ Layout cho phía User
│           │       ├── layout.tsx       # Header + Footer chung
│           │       ├── page.tsx         # Trang chủ (Hero + Hotels + Ưu đãi)
│           │       ├── hotel/
│           │       │   └── page.tsx     # ⭐ Danh sách khách sạn (API + Search)
│           │       ├── DetailHotel/
│           │       │   └── page.tsx     # Chi tiết khách sạn
│           │       ├── blog/
│           │       ├── contact/
│           │       └── offers/
│           ├── redux/
│           │   ├── provider.tsx         # ReduxProvider wrapper ("use client")
│           │   ├── store.js             # ⭐ Redux Store (auth + users + hotels)
│           │   └── slices/
│           │       ├── authSlice.js     # State đăng nhập/đăng xuất
│           │       ├── userSlice.js     # State danh sách users
│           │       └── hotelSlice.js    # ⭐ State khách sạn (list, loading, error)
│           └── services/
│               └── api.js              # ⭐ Axios instance + API functions
│
└── README.md                            # 📖 File hướng dẫn này
```

---

## 💻 Yêu cầu hệ thống

| Công cụ       | Phiên bản tối thiểu | Ghi chú                         |
| ------------- | -------------------- | ------------------------------- |
| **Node.js**   | 18.x trở lên        | Khuyến nghị LTS (20.x hoặc 22.x) |
| **npm**       | 9.x trở lên         | Đi kèm Node.js                 |
| **PostgreSQL**| 14.x trở lên        | Port mặc định: 5433            |
| **Git**       | 2.x trở lên         | Quản lý source code             |

---

## 🚀 Hướng dẫn Setup từ con số 0

### Bước 1: Cài đặt công cụ cần thiết

1. **Node.js**: Tải tại [https://nodejs.org](https://nodejs.org) (chọn bản LTS)
2. **PostgreSQL**: Tải tại [https://www.postgresql.org/download](https://www.postgresql.org/download)
   - Trong quá trình cài đặt, **nhớ ghi lại mật khẩu** cho user `postgres`
   - Ghi nhớ **port** (mặc định là 5432, dự án này dùng 5433)
3. **Git**: Tải tại [https://git-scm.com](https://git-scm.com)

### Bước 2: Clone / Tạo thư mục dự án

```bash
# Clone dự án (nếu có repo)
git clone <your-repo-url> Project
cd Project

# Hoặc tạo thư mục từ đầu
mkdir Project
cd Project
mkdir BE FE
```

### Bước 3: Setup Database PostgreSQL

```bash
# 1. Mở pgAdmin hoặc psql CLI
# 2. Tạo database mới
CREATE DATABASE project_db;

# 3. Cấu hình file .env trong thư mục BE/
# Mở file BE/.env và chỉnh sửa:
DATABASE_URL="postgresql://postgres:<your_password>@localhost:5433/project_db"
PORT=8080
SECRET_KEY=abc123
```

> ⚠️ **Lưu ý**: Thay `<your_password>` bằng mật khẩu PostgreSQL của bạn. Thay `5433` bằng port PostgreSQL thực tế (mặc định là 5432).

### Bước 4: Setup Backend (Express.js)

```bash
# 1. Di chuyển vào thư mục Backend
cd BE

# 2. Cài đặt tất cả thư viện
npm install

# Các thư viện sẽ được cài:
# - express (Web framework)
# - prisma + @prisma/client + @prisma/adapter-pg (ORM)
# - cors (Cross-Origin)
# - dotenv (Biến môi trường)
# - bcrypt (Mã hóa mật khẩu)
# - jsonwebtoken (JWT Auth)
# - swagger-jsdoc + swagger-ui-express (API Docs)
# - pg (PostgreSQL driver)

# 3. Generate Prisma Client (Tạo các model từ schema)
npx prisma generate

# 4. Đồng bộ schema lên Database (Tạo bảng)
npx prisma db push

# 5. (Tùy chọn) Mở Prisma Studio để xem/thêm dữ liệu
npx prisma studio
# → Mở trình duyệt: http://localhost:5555

# 6. Chạy Backend Server
node src/app.js
# Hoặc dùng nodemon cho auto-reload:
npx nodemon src/app.js
# → Server chạy tại: http://localhost:8080
# → Swagger Docs: http://localhost:8080/api-docs
```

### Bước 5: Setup Frontend (Next.js)

```bash
# 1. Di chuyển vào thư mục Frontend
cd FE/frontend

# 2. Cài đặt tất cả thư viện
npm install

# Các thư viện sẽ được cài:
# - next (Framework React)
# - react + react-dom
# - tailwindcss + @tailwindcss/postcss (CSS)
# - framer-motion (Animations)
# - @reduxjs/toolkit + react-redux (State Management)
# - axios (HTTP Client)
# - typescript + @types/react (TypeScript)

# 3. (Quan trọng) Cấu hình API URL
# Mở file: src/services/api.js
# Đổi baseURL thành IP/Port Backend của bạn:
# baseURL: "http://localhost:8080"
```

### Bước 6: Chạy ứng dụng

```bash
# Terminal 1 — Backend
cd BE
node src/app.js
# ✅ Server BE chạy tại: http://localhost:8080

# Terminal 2 — Frontend
cd FE/frontend
npm run dev
# ✅ Server FE chạy tại: http://localhost:3000
```

**Mở trình duyệt** → `http://localhost:3000`

✅ Trang chủ sẽ hiển thị danh sách khách sạn từ Database  
✅ Trang `/hotel` sẽ hiển thị đầy đủ với skeleton loading + animations

---

## 📦 Danh sách thư viện

### Backend (BE/package.json)

| Thư viện               | Phiên bản | Chức năng                    |
| ---------------------- | --------- | ---------------------------- |
| `express`              | ^5.2.1    | Web framework chính          |
| `prisma`               | ^7.8.0    | ORM CLI tool                 |
| `@prisma/client`       | ^7.8.0    | ORM Client (query database)  |
| `@prisma/adapter-pg`   | ^7.8.0    | PostgreSQL adapter           |
| `pg`                   | ^8.21.0   | PostgreSQL driver            |
| `cors`                 | ^2.8.6    | Cross-Origin requests        |
| `dotenv`               | ^17.4.2   | Biến môi trường              |
| `bcrypt`               | ^6.0.0    | Mã hóa mật khẩu             |
| `jsonwebtoken`         | ^9.0.3    | JWT Authentication           |
| `swagger-jsdoc`        | ^6.3.0    | Auto-generate API docs       |
| `swagger-ui-express`   | ^5.0.1    | UI cho Swagger docs          |
| `nodemon` (dev)        | ^3.1.14   | Auto-restart server          |

### Frontend (FE/frontend/package.json)

| Thư viện               | Phiên bản | Chức năng                    |
| ---------------------- | --------- | ---------------------------- |
| `next`                 | 16.2.7    | React framework (SSR/SSG)    |
| `react`                | 19.2.4    | UI library                   |
| `react-dom`            | 19.2.4    | React DOM rendering          |
| `framer-motion`        | latest    | Animations & transitions     |
| `@reduxjs/toolkit`     | latest    | State management             |
| `react-redux`          | latest    | React bindings for Redux     |
| `axios`                | latest    | HTTP client                  |
| `tailwindcss`          | ^4        | CSS framework                |
| `typescript`           | ^5        | Type checking                |

---

## 🔌 API Endpoints Reference

### Users (`/api/users`)
| Method | Endpoint          | Mô tả                |
| ------ | ----------------- | --------------------- |
| GET    | `/getAllUsers`     | Lấy tất cả users     |
| POST   | `/createUser`     | Tạo user mới          |

### Hotels (`/api/hotel`)
| Method | Endpoint              | Mô tả                          |
| ------ | --------------------- | ------------------------------- |
| GET    | `/getAllHotel`         | Lấy tất cả hotels + images + reviews |
| GET    | `/getHotelById/:id`   | Chi tiết hotel theo ID          |
| POST   | `/createHotel`        | Tạo hotel mới (kèm images)     |
| PUT    | `/updateHotel/:id`    | Cập nhật thông tin hotel        |
| DELETE | `/deleteHotel/:id`    | Xóa hotel                       |
| PATCH  | `/:id/status`         | Cập nhật trạng thái hotel       |

### Rooms (`/api/room`)
| Method | Endpoint                  | Mô tả                         |
| ------ | ------------------------- | ------------------------------ |
| GET    | `/getAllRoom`              | Lấy tất cả phòng              |
| GET    | `/getRoomByHotel/:hotelId`| Lấy phòng theo hotel ID       |
| POST   | `/createRoom`             | Tạo phòng mới                  |
| PUT    | `/updateRoom/:id`         | Cập nhật phòng                 |
| DELETE | `/deleteRoom/:id`         | Xóa phòng                      |
| PATCH  | `/:id/status`             | Cập nhật trạng thái phòng      |

### Reviews (`/api/reviews`)
| Method | Endpoint              | Mô tả                          |
| ------ | --------------------- | ------------------------------- |
| GET    | `/getReview/:id`      | Lấy reviews theo hotel ID      |
| POST   | `/createReview`       | Tạo review mới                  |
| DELETE | `/deleteReview/:id`   | Xóa review                      |

### Bookings (`/api/bookings`)
| Method | Endpoint              | Mô tả                          |
| ------ | --------------------- | ------------------------------- |
| POST   | `/createBooking`      | Tạo booking mới                 |

### Payments (`/api/payment`)
| Method | Endpoint              | Mô tả                          |
| ------ | --------------------- | ------------------------------- |
| POST   | `/createPayment`      | Tạo thanh toán                   |

> 📖 **Swagger UI**: Truy cập `http://localhost:8080/api-docs` để xem và test API trực tiếp trên trình duyệt.

---

## 🎨 Ghi chú thiết kế UI/UX

### Theme & Colors
- **Dark Theme chủ đạo**: Nền `#070c1e` (xanh đen sâu thẳm)
- **Gold Accent**: `#e5c158` (vàng luxury) cho CTA, highlights
- **Card Background**: `#0f1631` với border `slate-800/60`
- **Surface**: `#111836` cho inputs, tags

### Animations (Framer Motion)
- **FadeInUp**: Cards xuất hiện từ dưới lên với stagger delay
- **WhileHover**: Scale nhẹ (1.03-1.05) + translateY(-4px)
- **WhileInView**: Sections animate khi scroll vào viewport
- **Skeleton Loading**: Shimmer effect custom bằng CSS gradient animation

### Micro-interactions
- **Hover Card**: Border chuyển sang gold glow + shadow nâng lên
- **Hover Button**: Scale + shadow vàng mạnh hơn  
- **Focus Input**: Border chuyển vàng gold + box-shadow glow
- **Active Click**: Scale(0.95-0.97) feedback tức thời
- **Favorite Button**: Scale bounce + color transition

### Spacing & Border Radius
- Cards: `rounded-3xl` (24px) cho hiện đại
- Buttons: `rounded-2xl` (16px)
- Tags/Badges: `rounded-xl` (12px)
- Shadow: Dùng `rgba(229,193,88,0.06-0.15)` thay vì shadow đen bẩn
