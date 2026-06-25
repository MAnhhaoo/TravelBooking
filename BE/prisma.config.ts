const { defineConfig } = require("@prisma/config");
require("dotenv").config();

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Đọc trực tiếp từ biến môi trường DATABASE_URL trong file .env của bạn
    url: process.env.DATABASE_URL,
  },
});