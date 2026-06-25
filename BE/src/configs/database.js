// Nạp cấu hình từ file .env ngay khi file database.js này được gọi
require("dotenv").config(); 

const { PrismaClient } = require("@prisma/client");
// Adapter cho Postgres (Prisma 7 yêu cầu adapter hoặc accelerateUrl)
const { PrismaPg } = require("@prisma/adapter-pg");

// Tạo adapter từ DATABASE_URL và truyền cho PrismaClient
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;