const prisma = require('../src/configs/database.js');
const bcrypt = require('bcrypt');

async function main() {
  console.log("Bắt đầu seed dữ liệu vào DB...");

  // 1. Tạo Users
  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.users.upsert({
    where: { email: 'admin@travelbooking.com' },
    update: {},
    create: {
      full_name: 'Quản trị viên Hệ thống',
      email: 'admin@travelbooking.com',
      password: passwordHash,
      phone: '0901234567',
      role: 2,
    },
  });

  const owner = await prisma.users.upsert({
    where: { email: 'owner@travelbooking.com' },
    update: {},
    create: {
      full_name: 'Nguyễn Văn Chủ',
      email: 'owner@travelbooking.com',
      password: passwordHash,
      phone: '0912345678',
      role: 1,
    },
  });

  const customer = await prisma.users.upsert({
    where: { email: 'customer@travelbooking.com' },
    update: {},
    create: {
      full_name: 'Khách Hàng VIP',
      email: 'customer@travelbooking.com',
      password: passwordHash,
      phone: '0923456789',
      role: 0,
    },
  });
  console.log("✅ Tạo Users thành công!");

  // Lấy danh sách hotel để xem owner này có hotel chưa
  const existHotels = await prisma.hotels.findMany({ where: { owner_id: owner.user_id }});
  let hotel1, hotel2;
  
  if (existHotels.length === 0) {
    // 2. Tạo Hotels
    hotel1 = await prisma.hotels.create({
      data: {
        owner_id: owner.user_id,
        hotel_name: 'The Grand Luxury Palace',
        phone: '19001111',
        address: '01 Đường Biển Dài',
        city: 'Nha Trang',
        description: 'Khách sạn 5 sao cao cấp với view nhìn thẳng ra vịnh biển tuyệt đẹp.',
        star_rating: 5,
        status: 1,
        payment_status: 1,
        hotel_images: {
          create: [
            { image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' },
            { image_url: 'https://images.unsplash.com/photo-1542314831-c6a4d27ce6a2?w=800&q=80' }
          ]
        }
      }
    });

    hotel2 = await prisma.hotels.create({
      data: {
        owner_id: owner.user_id,
        hotel_name: 'Sapa Cloud Resort',
        phone: '19002222',
        address: 'Đỉnh Đèo Ô Quy Hồ',
        city: 'Sapa',
        description: 'Khu nghỉ dưỡng ẩn mình trong mây, mang lại cảm giác bình yên đến lạ thường.',
        star_rating: 4,
        status: 1,
        payment_status: 1,
        hotel_images: {
          create: [
            { image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80' }
          ]
        }
      }
    });
    console.log("✅ Tạo Khách sạn thành công!");
  } else {
    hotel1 = existHotels[0];
    hotel2 = existHotels[1] || existHotels[0];
    console.log("☑️ Khách sạn đã tồn tại, bỏ qua tạo khách sạn mới.");
  }

  // 3. Tạo Loại phòng (Room Types) nếu chưa có
  const typeDeluxe = await prisma.room_types.create({
    data: {
      type_name: 'Phòng Deluxe Hướng Biển ' + Date.now(),
      description: 'Phòng rộng rãi, giường King size, bồn tắm sục Jacuzzi.',
      max_guest: 2
    }
  });

  const typeFamily = await prisma.room_types.create({
    data: {
      type_name: 'Phòng Family Connecting ' + Date.now(),
      description: 'Phòng nối dành cho gia đình, không gian rộng rãi.',
      max_guest: 4
    }
  });

  // 4. Tạo Phòng (Rooms)
  const room1 = await prisma.rooms.create({
    data: {
      hotel_id: hotel1.hotel_id,
      room_type_id: typeDeluxe.room_type_id,
      room_number: '101',
      price_per_night: 2500000,
      status: 0,
      room_images: {
        create: [{ image_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80' }]
      }
    }
  });

  const room2 = await prisma.rooms.create({
    data: {
      hotel_id: hotel1.hotel_id,
      room_type_id: typeFamily.room_type_id,
      room_number: '102',
      price_per_night: 4000000,
      status: 0,
    }
  });
  console.log("✅ Tạo Phòng thành công!");

  // 5. Tạo Review
  await prisma.reviews.create({
    data: {
      user_id: customer.user_id,
      hotel_id: hotel1.hotel_id,
      rating: 5,
      comment: 'Trải nghiệm tuyệt vời! Khách sạn sạch sẽ, nhân viên thân thiện.',
    }
  });
  console.log("✅ Tạo Đánh giá thành công!");

  // 6. Tạo Booking mẫu
  const checkin = new Date();
  const checkout = new Date();
  checkout.setDate(checkout.getDate() + 2); // 2 đêm

  const booking = await prisma.bookings.create({
    data: {
      user_id: customer.user_id,
      room_id: room1.room_id,
      guest_count: 2,
      check_in: checkin,
      check_out: checkout,
      total_price: 5000000, // 2500000 * 2
      status: 1, // Đã xác nhận
    }
  });

  // 7. Tạo Thanh toán mẫu
  await prisma.payments.create({
    data: {
      booking_id: booking.booking_id,
      amount: 5000000,
      payment_method: "Credit Card",
      transaction_code: "TXN123456789",
      status: 1, // Đã thanh toán
      paid_at: new Date()
    }
  });
  console.log("✅ Tạo Booking & Thanh toán thành công!");

  console.log("🎉 SEED HOÀN TẤT RỰC RỠ!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
