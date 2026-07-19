// prisma/seed_large.js - Run with: node prisma/seed_large.js
const prisma = require('../src/configs/database.js');
const bcrypt = require('bcrypt');

async function main() {
  console.log("=== BẮT ĐẦU SEED DỮ LIỆU LỚN CHO TRAVELBOOKING ===");

  // 1. Dọn sạch dữ liệu cũ theo thứ tự quan hệ khóa ngoại (con trước, cha sau)
  console.log("Dọn dẹp các bảng cũ...");
  await prisma.payments.deleteMany({});
  await prisma.bookings.deleteMany({});
  await prisma.reviews.deleteMany({});
  await prisma.room_images.deleteMany({});
  await prisma.room_type_amenities.deleteMany({});
  await prisma.rooms.deleteMany({});
  await prisma.hotel_images.deleteMany({});
  await prisma.hotels.deleteMany({});
  await prisma.room_types.deleteMany({});
  await prisma.amenities.deleteMany({});
  console.log("✅ Dọn dẹp xong.");

  // 2. Thiết lập Users (Admin, Owner, Customers)
  const passwordHash = await bcrypt.hash('123456', 10);

  console.log("Đang thiết lập danh sách người dùng...");
  const adminUser = await prisma.users.upsert({
    where: { email: 'admin@travelbooking.com' },
    update: { password: passwordHash },
    create: { full_name: 'Quản trị viên Hệ thống', email: 'admin@travelbooking.com', password: passwordHash, phone: '0901234567', role: 2 }
  });

  const ownerUser = await prisma.users.upsert({
    where: { email: 'owner@travelbooking.com' },
    update: { password: passwordHash },
    create: { full_name: 'Nguyễn Văn Chủ', email: 'owner@travelbooking.com', password: passwordHash, phone: '0912345678', role: 1 }
  });

  // Tạo thêm owner thứ 2, 3, 4, 5 để dữ liệu phong phú và phân bổ đều khách sạn
  const ownerUser2 = await prisma.users.upsert({
    where: { email: 'owner2@travelbooking.com' },
    update: { password: passwordHash },
    create: { full_name: 'Trần Thị Chủ', email: 'owner2@travelbooking.com', password: passwordHash, phone: '0913456789', role: 1 }
  });
  const ownerUser3 = await prisma.users.upsert({
    where: { email: 'owner3@travelbooking.com' },
    update: { password: passwordHash },
    create: { full_name: 'Lê Văn Chủ 3', email: 'owner3@travelbooking.com', password: passwordHash, phone: '0914567890', role: 1 }
  });
  const ownerUser4 = await prisma.users.upsert({
    where: { email: 'owner4@travelbooking.com' },
    update: { password: passwordHash },
    create: { full_name: 'Phạm Văn Chủ 4', email: 'owner4@travelbooking.com', password: passwordHash, phone: '0915678901', role: 1 }
  });
  const ownerUser5 = await prisma.users.upsert({
    where: { email: 'owner5@travelbooking.com' },
    update: { password: passwordHash },
    create: { full_name: 'Hoàng Văn Chủ 5', email: 'owner5@travelbooking.com', password: passwordHash, phone: '0916789012', role: 1 }
  });

  const ownersList = [ownerUser.user_id, ownerUser2.user_id, ownerUser3.user_id, ownerUser4.user_id, ownerUser5.user_id];

  // Tạo danh sách 12 khách hàng để viết review chân thực
  const customers = [];
  const customerData = [
    { name: 'Trần Thanh Sơn', email: 'son.tran@gmail.com', phone: '0987111222' },
    { name: 'Nguyễn Bích Phương', email: 'phuong.nguyen@gmail.com', phone: '0987222333' },
    { name: 'Lê Minh Triết', email: 'triet.le@gmail.com', phone: '0987333444' },
    { name: 'Phạm Kiều Trang', email: 'trang.pham@gmail.com', phone: '0987444555' },
    { name: 'Hoàng Anh Tuấn', email: 'tuan.hoang@gmail.com', phone: '0987555666' },
    { name: 'Vũ Thùy Linh', email: 'linh.vu@gmail.com', phone: '0987666777' },
    { name: 'Đặng Quốc Huy', email: 'huy.dang@gmail.com', phone: '0987777888' },
    { name: 'Bùi Thị Mai', email: 'mai.bui@gmail.com', phone: '0987888999' },
    { name: 'Ngô Thành Long', email: 'long.ngo@gmail.com', phone: '0987999000' },
    { name: 'Đinh Thị Hoa', email: 'hoa.dinh@gmail.com', phone: '0988000111' },
    { name: 'Trương Văn Khoa', email: 'khoa.truong@gmail.com', phone: '0988111222' },
    { name: 'Lý Thị Ngân', email: 'ngan.ly@gmail.com', phone: '0988222333' },
  ];

  for (const c of customerData) {
    const user = await prisma.users.upsert({
      where: { email: c.email },
      update: {},
      create: { full_name: c.name, email: c.email, password: passwordHash, phone: c.phone, role: 0 }
    });
    customers.push(user);
  }
  console.log(`✅ Đã thiết lập ${customers.length} người dùng khách hàng mẫu.`);

  // 3. Tạo Amenities (tiện nghi) cho hệ thống
  console.log("Đang tạo danh sách tiện nghi...");
  const amenitiesData = [
    { amenity_name: 'WiFi tốc độ cao miễn phí' },
    { amenity_name: 'Điều hòa nhiệt độ' },
    { amenity_name: 'Smart TV 55 inch' },
    { amenity_name: 'Minibar cao cấp' },
    { amenity_name: 'Bồn tắm Jacuzzi' },
    { amenity_name: 'Phòng tắm đứng riêng' },
    { amenity_name: 'Két sắt điện tử' },
    { amenity_name: 'Máy pha cà phê Nespresso' },
    { amenity_name: 'Bữa sáng Buffet miễn phí' },
    { amenity_name: 'Hồ bơi vô cực' },
    { amenity_name: 'Trung tâm Spa & Wellness' },
    { amenity_name: 'Phòng gym hiện đại' },
    { amenity_name: 'Dịch vụ phòng 24/7' },
    { amenity_name: 'Đưa đón sân bay' },
    { amenity_name: 'Ban công view biển' },
    { amenity_name: 'Bãi đỗ xe miễn phí' },
  ];

  const createdAmenities = [];
  for (const a of amenitiesData) {
    const amenity = await prisma.amenities.create({ data: a });
    createdAmenities.push(amenity);
  }
  console.log(`✅ Đã tạo ${createdAmenities.length} tiện nghi.`);

  // Helper: lấy amenity theo tên
  const getAmenity = (name) => createdAmenities.find(a => a.amenity_name === name);

  // 4. Tạo Room Types chính thức kèm amenities
  console.log("Đang tạo các loại phòng...");

  const rtStandard = await prisma.room_types.create({
    data: {
      type_name: 'Standard Room',
      description: 'Phòng tiêu chuẩn ấm cúng đầy đủ tiện nghi cơ bản, thích hợp cho du khách cần lưu trú ngắn ngày.',
      max_guest: 2,
      room_type_amenities: {
        create: [
          { amenity_id: getAmenity('WiFi tốc độ cao miễn phí').amenity_id },
          { amenity_id: getAmenity('Điều hòa nhiệt độ').amenity_id },
          { amenity_id: getAmenity('Smart TV 55 inch').amenity_id },
          { amenity_id: getAmenity('Két sắt điện tử').amenity_id },
          { amenity_id: getAmenity('Dịch vụ phòng 24/7').amenity_id },
        ]
      }
    }
  });

  const rtDeluxe = await prisma.room_types.create({
    data: {
      type_name: 'Deluxe Suite',
      description: 'Phòng deluxe cao cấp rộng rãi, view đẹp, có ban công riêng và phòng tắm sang trọng với bồn tắm riêng biệt.',
      max_guest: 2,
      room_type_amenities: {
        create: [
          { amenity_id: getAmenity('WiFi tốc độ cao miễn phí').amenity_id },
          { amenity_id: getAmenity('Điều hòa nhiệt độ').amenity_id },
          { amenity_id: getAmenity('Smart TV 55 inch').amenity_id },
          { amenity_id: getAmenity('Minibar cao cấp').amenity_id },
          { amenity_id: getAmenity('Phòng tắm đứng riêng').amenity_id },
          { amenity_id: getAmenity('Két sắt điện tử').amenity_id },
          { amenity_id: getAmenity('Máy pha cà phê Nespresso').amenity_id },
          { amenity_id: getAmenity('Dịch vụ phòng 24/7').amenity_id },
        ]
      }
    }
  });

  const rtSuiteJunior = await prisma.room_types.create({
    data: {
      type_name: 'Suite Junior',
      description: 'Phòng Suite Junior sang trọng dành cho cặp đôi, thiết kế không gian mở kết hợp phòng ngủ và phòng khách.',
      max_guest: 2,
      room_type_amenities: {
        create: [
          { amenity_id: getAmenity('WiFi tốc độ cao miễn phí').amenity_id },
          { amenity_id: getAmenity('Điều hòa nhiệt độ').amenity_id },
          { amenity_id: getAmenity('Smart TV 55 inch').amenity_id },
          { amenity_id: getAmenity('Minibar cao cấp').amenity_id },
          { amenity_id: getAmenity('Bồn tắm Jacuzzi').amenity_id },
          { amenity_id: getAmenity('Phòng tắm đứng riêng').amenity_id },
          { amenity_id: getAmenity('Két sắt điện tử').amenity_id },
          { amenity_id: getAmenity('Máy pha cà phê Nespresso').amenity_id },
          { amenity_id: getAmenity('Bữa sáng Buffet miễn phí').amenity_id },
          { amenity_id: getAmenity('Dịch vụ phòng 24/7').amenity_id },
        ]
      }
    }
  });

  const rtSuiteGrand = await prisma.room_types.create({
    data: {
      type_name: 'Suite Grand',
      description: 'Phòng Suite Grand thượng hạng đẳng cấp bậc nhất với phòng khách riêng, phòng bếp nhỏ và bồn tắm Jacuzzi nhìn ra biển.',
      max_guest: 4,
      room_type_amenities: {
        create: [
          { amenity_id: getAmenity('WiFi tốc độ cao miễn phí').amenity_id },
          { amenity_id: getAmenity('Điều hòa nhiệt độ').amenity_id },
          { amenity_id: getAmenity('Smart TV 55 inch').amenity_id },
          { amenity_id: getAmenity('Minibar cao cấp').amenity_id },
          { amenity_id: getAmenity('Bồn tắm Jacuzzi').amenity_id },
          { amenity_id: getAmenity('Phòng tắm đứng riêng').amenity_id },
          { amenity_id: getAmenity('Két sắt điện tử').amenity_id },
          { amenity_id: getAmenity('Máy pha cà phê Nespresso').amenity_id },
          { amenity_id: getAmenity('Bữa sáng Buffet miễn phí').amenity_id },
          { amenity_id: getAmenity('Hồ bơi vô cực').amenity_id },
          { amenity_id: getAmenity('Trung tâm Spa & Wellness').amenity_id },
          { amenity_id: getAmenity('Dịch vụ phòng 24/7').amenity_id },
          { amenity_id: getAmenity('Đưa đón sân bay').amenity_id },
          { amenity_id: getAmenity('Ban công view biển').amenity_id },
        ]
      }
    }
  });
  console.log("✅ Đã tạo 4 loại phòng kèm tiện nghi.");

  // 5. Pool ảnh chất lượng cao theo chủ đề thành phố
  const IMAGES_POOL = {
    hanoi: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-c6a4d27ce6a2?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'
    ],
    danang: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      'https://images.unsplash.com/photo-1564507592937-25994a9015b2?w=800&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80'
    ],
    nhatrang: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80'
    ],
    phuquoc: [
      'https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'
    ],
    hoian: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'
    ],
    dalat: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-c6a4d27ce6a2?w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80'
    ],
    sapa: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80'
    ],
    vungtau: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-c6a4d27ce6a2?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80'
    ]
  };

  // Pool ảnh phòng
  const ROOM_IMAGES_POOL = [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
  ];

  // Danh sách đánh giá phong phú
  const COMMENTS = [
    { rating: 5, text: "Khách sạn quá tuyệt vời! Phòng ốc rộng rãi, dịch vụ 5 sao chuẩn mực. Nhân viên cực kỳ nhiệt tình và thân thiện." },
    { rating: 5, text: "Nhân viên thân thiện, đồ ăn sáng buffet rất phong phú và ngon miệng! Hồ bơi vô cực cực đẹp." },
    { rating: 4, text: "Vị trí vô cùng đắc địa, đi lại thuận tiện. View ngắm cảnh rất đẹp, sẽ quay lại lần sau." },
    { rating: 4, text: "Phòng đẹp, sạch sẽ, hồ bơi vô cực ngắm hoàng hôn rất chill. Giá cả hợp lý." },
    { rating: 5, text: "Kỳ nghỉ đáng nhớ cho cả gia đình tôi. Trẻ em được quan tâm rất chu đáo. Sẽ quay lại!" },
    { rating: 3, text: "Khách sạn tốt nhưng giá hơi cao vào dịp cuối tuần. Phòng cần cải thiện thêm về âm thanh cách âm." },
    { rating: 4, text: "Không gian yên tĩnh, lãng mạn thích hợp nghỉ dưỡng cho cặp đôi. Bữa tối nhà hàng rất ngon." },
    { rating: 5, text: "Check-in nhanh, nhân viên chuyên nghiệp. Phòng rất sạch và view tuyệt đẹp. Highly recommended!" },
    { rating: 4, text: "Resort cực đẹp, bãi biển riêng tư yên tĩnh. Dịch vụ spa thư giãn tuyệt vời. Sẽ giới thiệu cho bạn bè." },
    { rating: 5, text: "Trải nghiệm hoàn hảo từ đầu đến cuối. Đặt phòng online dễ dàng, check-in nhanh, phòng vượt kỳ vọng." },
    { rating: 3, text: "Khách sạn ở vị trí tốt, tuy nhiên wifi hơi chậm. Nhân viên lễ tân rất nhiệt tình, bù lại." },
    { rating: 5, text: "Một trong những resort tốt nhất tôi từng ở. Bữa sáng rất phong phú, view biển tuyệt đỉnh!" },
  ];

  // 6. Dữ liệu 30 khách sạn nổi tiếng Việt Nam
  const HOTELS_DATA = [
    // --- Hà Nội ---
    {
      name: "Melia Hanoi Hotel",
      phone: "02439343343",
      address: "44 Lý Thường Kiệt, Quận Hoàn Kiếm",
      city: "Ha Noi",
      description: "Khách sạn 5 sao mang tầm vóc quốc tế nằm ngay tại trung tâm ngoại giao và tài chính của Hà Nội. Nổi bật với ẩm thực Tây Ban Nha độc đáo cùng dịch vụ The Level cao cấp.",
      star_rating: 5,
      pool: "hanoi",
      owner: ownerUser,
      rooms: [
        { rt: rtDeluxe, num: "801", price: 3200000 },
        { rt: rtSuiteJunior, num: "902", price: 4500000 },
        { rt: rtSuiteGrand, num: "1203", price: 7800000 }
      ]
    },
    {
      name: "Sofitel Legend Metropole Hanoi",
      phone: "02438266919",
      address: "15 Ngô Quyền, Quận Hoàn Kiếm",
      city: "Ha Noi",
      description: "Biểu tượng kiến trúc Pháp cổ kính xây dựng từ năm 1901. Nơi lưu giữ những câu chuyện lịch sử hào hùng và đón tiếp vô số nguyên thủ quốc gia và siêu sao thế giới.",
      star_rating: 5,
      pool: "hanoi",
      owner: ownerUser,
      rooms: [
        { rt: rtSuiteJunior, num: "Classic-101", price: 6500000 },
        { rt: rtSuiteGrand, num: "Opera-302", price: 11000000 },
        { rt: rtDeluxe, num: "Premium-205", price: 5200000 }
      ]
    },
    {
      name: "InterContinental Hanoi Westlake",
      phone: "02462708888",
      address: "05 Từ Hoa, Quận Tây Hồ",
      city: "Ha Noi",
      description: "Trải nghiệm độc đáo với các pavilion xây nổi hoàn toàn trên mặt nước Hồ Tây thơ mộng. Tận hưởng hoàng hôn lãng mạn bậc nhất thủ đô.",
      star_rating: 5,
      pool: "hanoi",
      owner: ownerUser,
      rooms: [
        { rt: rtStandard, num: "W-105", price: 2900000 },
        { rt: rtDeluxe, num: "W-204", price: 3900000 },
        { rt: rtSuiteGrand, num: "W-310", price: 8500000 }
      ]
    },
    {
      name: "Hanoi La Siesta Hotel & Spa",
      phone: "02439290011",
      address: "94 Mã Mây, Quận Hoàn Kiếm",
      city: "Ha Noi",
      description: "Khách sạn boutique quyến rũ nép mình trong lòng phố cổ Hà Nội. Nổi tiếng với chất lượng phục vụ chu đáo, thân thiện đạt điểm số tối đa trên TripAdvisor.",
      star_rating: 4,
      pool: "hanoi",
      owner: ownerUser2,
      rooms: [
        { rt: rtStandard, num: "M-101", price: 1600000 },
        { rt: rtDeluxe, num: "M-202", price: 2300000 }
      ]
    },
    {
      name: "Lotte Hotel Hanoi",
      phone: "02438331000",
      address: "54 Liễu Giai, Quận Ba Đình",
      city: "Ha Noi",
      description: "Tòa tháp 65 tầng biểu tượng của Hà Nội hiện đại với đài quan sát Top of Hanoi tầng 65. Phòng nghỉ hướng toàn cảnh thành phố và Hồ Tây tuyệt đẹp.",
      star_rating: 5,
      pool: "hanoi",
      owner: ownerUser2,
      rooms: [
        { rt: rtStandard, num: "L-2501", price: 3100000 },
        { rt: rtDeluxe, num: "L-3002", price: 4200000 },
        { rt: rtSuiteGrand, num: "L-Premier", price: 9500000 }
      ]
    },
    // --- Đà Nẵng ---
    {
      name: "InterContinental Danang Sun Peninsula Resort",
      phone: "02363938888",
      address: "Bán đảo Sơn Trà",
      city: "Da Nang",
      description: "Kiệt tác nghỉ dưỡng được thiết kế bởi kiến trúc sư lừng danh Bill Bensley. Trải dài qua 4 tầng sinh cảnh: Thiên đường, Bầu trời, Mặt đất và Biển cả.",
      star_rating: 5,
      pool: "danang",
      owner: ownerUser,
      rooms: [
        { rt: rtSuiteJunior, num: "Resort-Classic", price: 9500000 },
        { rt: rtSuiteGrand, num: "Atrium-Suite", price: 15000000 },
        { rt: rtDeluxe, num: "Ocean-Villa", price: 22000000 }
      ]
    },
    {
      name: "Hyatt Regency Danang Resort & Spa",
      phone: "02363981234",
      address: "5 Trường Sa, Quận Ngũ Hành Sơn",
      city: "Da Nang",
      description: "Resort đẳng cấp thế giới tọa lạc bên bờ biển Non Nước cát trắng mịn màng. Thiết kế đương đại tinh tế hòa hợp hoàn hảo với thiên nhiên nhiệt đới.",
      star_rating: 5,
      pool: "danang",
      owner: ownerUser,
      rooms: [
        { rt: rtStandard, num: "H-102", price: 3400000 },
        { rt: rtDeluxe, num: "H-204", price: 4600000 },
        { rt: rtSuiteGrand, num: "V-VIP1", price: 12500000 }
      ]
    },
    {
      name: "Novotel Danang Premier Han River",
      phone: "02363923999",
      address: "36 Bạch Đằng, Quận Hải Châu",
      city: "Da Nang",
      description: "Nằm bên bờ Tây sông Hàn thơ mộng, Novotel sở hữu vị trí đắt giá ngắm trọn vẹn những cây cầu ánh sáng của Đà Nẵng và Lễ hội pháo hoa quốc tế.",
      star_rating: 4,
      pool: "danang",
      owner: ownerUser2,
      rooms: [
        { rt: rtStandard, num: "Han-1201", price: 2100000 },
        { rt: rtDeluxe, num: "Han-1502", price: 3200000 }
      ]
    },
    {
      name: "A La Carte Danang Beach",
      phone: "02363959555",
      address: "200 Võ Nguyên Giáp, Quận Sơn Trà",
      city: "Da Nang",
      description: "Phong cách sống năng động, hiện đại với hồ bơi vô cực tầng thượng đầu tiên tại Việt Nam, mang đến tầm nhìn toàn cảnh ngoạn mục ra bán đảo Sơn Trà.",
      star_rating: 4,
      pool: "danang",
      owner: ownerUser2,
      rooms: [
        { rt: rtStandard, num: "ALC-405", price: 1550000 },
        { rt: rtDeluxe, num: "ALC-708", price: 2250000 }
      ]
    },
    // --- Nha Trang ---
    {
      name: "Vinpearl Resort & Spa Nha Trang Bay",
      phone: "02583598999",
      address: "Đảo Hòn Tre, Vịnh Nha Trang",
      city: "Nha Trang",
      description: "Khu nghỉ dưỡng lý tưởng cho gia đình trên đảo Hòn Tre biệt lập. Kiến trúc hình cánh cung hiện đại ôm trọn bờ cát trắng nguyên sơ và làn nước trong vắt.",
      star_rating: 5,
      pool: "nhatrang",
      owner: ownerUser,
      rooms: [
        { rt: rtDeluxe, num: "V-201", price: 3800000 },
        { rt: rtSuiteJunior, num: "V-305", price: 5000000 },
        { rt: rtSuiteGrand, num: "Villa-3Chamber", price: 9200000 }
      ]
    },
    {
      name: "Sheraton Nha Trang Hotel & Spa",
      phone: "02583880000",
      address: "26-28 Trần Phú",
      city: "Nha Trang",
      description: "Toạ lạc trên cung đường biển đẹp nhất Nha Trang. Tất cả các phòng nghỉ đều có ban công hướng biển đón gió trong lành từ vịnh Nha Trang xanh ngọc.",
      star_rating: 5,
      pool: "nhatrang",
      owner: ownerUser,
      rooms: [
        { rt: rtStandard, num: "S-1402", price: 2400000 },
        { rt: rtDeluxe, num: "S-1805", price: 3400000 },
        { rt: rtSuiteGrand, num: "S-Executive", price: 7200000 }
      ]
    },
    {
      name: "Amiana Resort Nha Trang",
      phone: "02583553333",
      address: "Phạm Văn Đồng, Tổ 14, Phường Vĩnh Hòa",
      city: "Nha Trang",
      description: "Khu nghỉ dưỡng 5 sao yên bình bên vịnh Nha Trang với hồ bơi nước mặn tự nhiên rộng 2.500m2 và bãi tắm cát trắng riêng tư tuyệt đối.",
      star_rating: 5,
      pool: "nhatrang",
      owner: ownerUser2,
      rooms: [
        { rt: rtDeluxe, num: "Ocean-Villa-1", price: 4800000 },
        { rt: rtSuiteGrand, num: "Family-Villa-2", price: 8900000 }
      ]
    },
    // --- Phú Quốc ---
    {
      name: "JW Marriott Phu Quoc Emerald Bay Resort & Spa",
      phone: "02973779999",
      address: "Bãi Khem, An Thới",
      city: "Phu Quoc",
      description: "Tác phẩm nghệ thuật đỉnh cao lấy cảm hứng từ trường đại học giả tưởng Lamarck University những năm 1920 bên bờ cát trắng Bãi Khem trứ danh.",
      star_rating: 5,
      pool: "phuquoc",
      owner: ownerUser,
      rooms: [
        { rt: rtSuiteJunior, num: "Emerald-101", price: 8200000 },
        { rt: rtSuiteGrand, num: "Grand-Lamarck", price: 14000000 },
        { rt: rtDeluxe, num: "Rue-de-Lamarck", price: 6800000 }
      ]
    },
    {
      name: "InterContinental Phu Quoc Long Beach Resort",
      phone: "02973978888",
      address: "Bãi Trường, Dương Tơ",
      city: "Phu Quoc",
      description: "Sang trọng, thanh lịch giao hòa giữa nét quyến rũ nguyên sơ của Đảo Ngọc. Trải nghiệm quán bar tầng thượng INK 360 hình bạch tuộc độc đáo nhất Việt Nam.",
      star_rating: 5,
      pool: "phuquoc",
      owner: ownerUser,
      rooms: [
        { rt: rtStandard, num: "IC-302", price: 3800000 },
        { rt: rtDeluxe, num: "IC-504", price: 5200000 },
        { rt: rtSuiteGrand, num: "IC-Suite-10", price: 9500000 }
      ]
    },
    {
      name: "Novotel Phu Quoc Resort",
      phone: "02973983999",
      address: "Bãi Trường, Dương Tơ",
      city: "Phu Quoc",
      description: "Resort gia đình tuyệt vời bên bờ biển phía Tây thơ mộng. Trải nghiệm các căn villa hồ bơi riêng nằm giữa những khu vườn nhiệt đới xanh mướt mát.",
      star_rating: 4,
      pool: "phuquoc",
      owner: ownerUser2,
      rooms: [
        { rt: rtStandard, num: "N-201", price: 1900000 },
        { rt: rtDeluxe, num: "N-Villa-5", price: 4200000 }
      ]
    },
    // --- Hội An ---
    {
      name: "Anantara Hoi An Resort",
      phone: "02353914555",
      address: "1 Phạm Hồng Thái",
      city: "Hoi An",
      description: "Khu nghỉ dưỡng xinh đẹp nép mình bên dòng sông Thu Bồn lãng mạn. Lối kiến trúc Pháp, Hà Lan, Nhật Bản pha trộn hoàn hảo mang đậm hồn cốt phố cổ.",
      star_rating: 5,
      pool: "hoian",
      owner: ownerUser,
      rooms: [
        { rt: rtDeluxe, num: "River-101", price: 4600000 },
        { rt: rtSuiteJunior, num: "River-202", price: 6200000 }
      ]
    },
    {
      name: "Four Seasons Resort The Nam Hai",
      phone: "02353940000",
      address: "Khối Hà My Đông B, Điện Bàn",
      city: "Hoi An",
      description: "Ốc đảo sang trọng bậc nhất Châu Á bên bờ biển Hà My nguyên sơ. Lấy cảm hứng từ triết lý phong thủy truyền thống kết hợp tinh hoa đương đại.",
      star_rating: 5,
      pool: "hoian",
      owner: ownerUser,
      rooms: [
        { rt: rtSuiteJunior, num: "V-1Bedroom", price: 18000000 },
        { rt: rtSuiteGrand, num: "V-3Bedroom", price: 35000000 }
      ]
    },
    {
      name: "Hoi An Silk Marina Resort & Spa",
      phone: "02353938888",
      address: "74 Nguyễn Phúc Tần",
      city: "Hoi An",
      description: "Trải nghiệm resort boutique thơ mộng nằm ngay cạnh dòng sông Hoài thơ mộng, chỉ cách chợ đêm Hội An vài phút đi bộ.",
      star_rating: 4,
      pool: "hoian",
      owner: ownerUser2,
      rooms: [
        { rt: rtStandard, num: "M-105", price: 1350000 },
        { rt: rtDeluxe, num: "M-308", price: 2100000 }
      ]
    },
    // --- Đà Lạt ---
    {
      name: "Dalat Palace Heritage Hotel",
      phone: "02633825444",
      address: "02 Trần Phú",
      city: "Da Lat",
      description: "Được xây dựng từ năm 1922, đây là khách sạn di sản cổ kính và sang trọng bậc nhất Đà Lạt, sở hữu tầm nhìn trực diện ra Hồ Xuân Hương mộng mơ.",
      star_rating: 5,
      pool: "dalat",
      owner: ownerUser,
      rooms: [
        { rt: rtDeluxe, num: "P-101", price: 3500000 },
        { rt: rtSuiteJunior, num: "P-202", price: 4900000 },
        { rt: rtSuiteGrand, num: "P-Royal", price: 9000000 }
      ]
    },
    {
      name: "Ana Mandara Villas Dalat Resort & Spa",
      phone: "02633555888",
      address: "Lê Lai, Phường 5",
      city: "Da Lat",
      description: "Quần thể biệt thự di sản Pháp cổ từ những năm 1920 - 1930 ẩn hiện dưới rừng thông Đà Lạt xanh rì, mang đậm nét lãng mạn, hoài cổ.",
      star_rating: 5,
      pool: "dalat",
      owner: ownerUser2,
      rooms: [
        { rt: rtStandard, num: "Villa-6-1", price: 2100000 },
        { rt: rtDeluxe, num: "Villa-9-2", price: 3300000 }
      ]
    },
    {
      name: "Swiss-Belresort Tuyen Lam Dalat",
      phone: "02633799799",
      address: "Khu du lịch hồ Tuyền Lâm",
      city: "Da Lat",
      description: "Sở hữu kiến trúc lâu đài Anglo-Normand tráng lệ mô phỏng vùng nông thôn châu Âu thanh bình bên cạnh sân golf 18 hố đẳng cấp ven hồ Tuyền Lâm.",
      star_rating: 4,
      pool: "dalat",
      owner: ownerUser2,
      rooms: [
        { rt: rtStandard, num: "SBL-302", price: 1450000 },
        { rt: rtDeluxe, num: "SBL-506", price: 2200000 }
      ]
    },
    // --- Sa Pa ---
    {
      name: "Hotel de la Coupole - MGallery",
      phone: "02143629999",
      address: "1 Hoàng Liên, Thị xã Sa Pa",
      city: "Sapa",
      description: "Tác phẩm nghệ thuật đỉnh cao hòa quyện giữa thời trang Pháp cổ điển và sắc màu văn hóa rực rỡ của các dân tộc thiểu số vùng Tây Bắc.",
      star_rating: 5,
      pool: "sapa",
      owner: ownerUser,
      rooms: [
        { rt: rtDeluxe, num: "Coup-305", price: 3600000 },
        { rt: rtSuiteJunior, num: "Coup-502", price: 5400000 },
        { rt: rtSuiteGrand, num: "Coup-Pres", price: 9900000 }
      ]
    },
    {
      name: "Topas Ecolodge Sapa",
      phone: "02473009000",
      address: "Bản Lếch, Thanh Kim, Sa Pa",
      city: "Sapa",
      description: "Được National Geographic bình chọn là một trong những khu nghỉ sinh thái độc đáo nhất thế giới. Sở hữu hai hồ bơi vô cực nước nóng tràn bờ ngoạn mục giữa mây núi.",
      star_rating: 4,
      pool: "sapa",
      owner: ownerUser2,
      rooms: [
        { rt: rtDeluxe, num: "Bung-15", price: 5800000 },
        { rt: rtSuiteJunior, num: "Bung-VIP", price: 8200000 }
      ]
    },
    {
      name: "Pao's Sapa Leisure Hotel",
      phone: "02146253999",
      address: "Mường Hoa, Thị xã Sa Pa",
      city: "Sapa",
      description: "Tọa lạc sườn đồi thơ mộng, Pao's Sapa sở hữu kiến trúc uốn lượn tinh tế mô phỏng ruộng bậc thang, ôm trọn thung lũng Mường Hoa tuyệt mỹ.",
      star_rating: 4,
      pool: "sapa",
      owner: ownerUser2,
      rooms: [
        { rt: rtStandard, num: "P-401", price: 1600000 },
        { rt: rtDeluxe, num: "P-602", price: 2500000 }
      ]
    },
    // --- Vũng Tàu ---
    {
      name: "The Imperial Hotel Vung Tau",
      phone: "02543628888",
      address: "159 Thùy Vân, Thắng Tam",
      city: "Vung Tau",
      description: "Khách sạn 5 sao duy nhất mang phong cách hoàng gia Anh cổ điển tráng lệ tại Vũng Tàu. Nằm ngay Bãi Sau nhộn nhịp sôi động.",
      star_rating: 5,
      pool: "vungtau",
      owner: ownerUser,
      rooms: [
        { rt: rtStandard, num: "Imp-102", price: 2500000 },
        { rt: rtDeluxe, num: "Imp-305", price: 3800000 },
        { rt: rtSuiteGrand, num: "Imp-Royal", price: 8200000 }
      ]
    },
    {
      name: "Marina Bay Vung Tau Resort & Spa",
      phone: "02543848888",
      address: "115 Trần Phú, Phường 5",
      city: "Vung Tau",
      description: "Resort 5 sao đầu tiên xây dựng sát biển tại cung đường Trần Phú. Nơi ngắm hoàng hôn buông xuống mặt biển thơ mộng bậc nhất.",
      star_rating: 5,
      pool: "vungtau",
      owner: ownerUser,
      rooms: [
        { rt: rtDeluxe, num: "MB-201", price: 3100000 },
        { rt: rtSuiteJunior, num: "MB-502", price: 4600000 }
      ]
    },
    {
      name: "Pullman Vung Tau",
      phone: "02543551777",
      address: "15 Thi Sách, Thắng Tam",
      city: "Vung Tau",
      description: "Phong cách sống năng động chuẩn quốc tế của Accor. Thiết kế hình mái vòm nổi bật độc đáo cùng trung tâm hội nghị hội thảo sầm uất.",
      star_rating: 5,
      pool: "vungtau",
      owner: ownerUser2,
      rooms: [
        { rt: rtStandard, num: "P-1015", price: 2200000 },
        { rt: rtDeluxe, num: "P-1420", price: 3200000 }
      ]
    },
    {
      name: "Vias Hotel Vung Tau",
      phone: "02543541111",
      address: "179 Thùy Vân, Thắng Tam",
      city: "Vung Tau",
      description: "Khách sạn 4 sao phong cách trẻ trung thời thượng nằm trực diện Bãi Sau. Sở hữu hồ bơi vô cực trên cao ngắm trọn vẹn dải bờ biển Thùy Vân.",
      star_rating: 4,
      pool: "vungtau",
      owner: ownerUser2,
      rooms: [
        { rt: rtStandard, num: "Vias-305", price: 1400000 },
        { rt: rtDeluxe, num: "Vias-508", price: 2150000 }
      ]
    }
  ];

  // 7. Tạo Hotels, Rooms (kèm ảnh phòng), Reviews
  let hotelCount = 0;
  const createdRooms = []; // Lưu lại rooms để tạo bookings sau
  const createdHotels = []; // Lưu lại hotels cho vouchers sau

  for (let hIdx = 0; hIdx < HOTELS_DATA.length; hIdx++) {
    const h = HOTELS_DATA[hIdx];
    const imgUrls = IMAGES_POOL[h.pool] || IMAGES_POOL.hanoi;
    const assignedOwnerId = ownersList[hIdx % ownersList.length];

    const createdHotel = await prisma.hotels.create({
      data: {
        owner_id: assignedOwnerId,
        hotel_name: h.name,
        phone: h.phone,
        address: h.address,
        city: h.city,
        description: h.description,
        star_rating: h.star_rating,
        status: 1,
        payment_status: 1,
        // Ảnh khách sạn
        hotel_images: {
          create: imgUrls.map(url => ({ image_url: url }))
        },
        // Tạo 10 phòng cho mỗi khách sạn
        rooms: {
          create: Array.from({ length: 10 }, (_, rIdx) => {
            const rList = h.rooms || [];
            const baseR = rList[rIdx % rList.length] || { rt: rtStandard, price: 1500000 };
            const floor = Math.floor(rIdx / 2) + 1;
            const numStr = `${floor}0${(rIdx % 2) + 1}`;
            return {
              room_type_id: baseR.rt.room_type_id,
              room_number: `${numStr}`,
              price_per_night: baseR.price + (rIdx * 120000),
              status: rIdx === 2 ? 1 : 0,
              room_images: {
                create: [0, 1, 2, 3].map(offset => ({
                  image_url: ROOM_IMAGES_POOL[(rIdx + offset) % ROOM_IMAGES_POOL.length]
                }))
              }
            };
          })
        }
      },
      include: {
        rooms: { select: { room_id: true, price_per_night: true } }
      }
    });

    createdHotels.push(createdHotel);

    // Lưu rooms của hotel này
    createdRooms.push(...createdHotel.rooms.map(r => ({
      room_id: r.room_id,
      price_per_night: Number(r.price_per_night),
      hotel_id: createdHotel.hotel_id
    })));

    // Tạo 5-8 reviews chân thực ngẫu nhiên từ danh sách khách hàng
    const numReviews = Math.floor(Math.random() * 4) + 5; // 5-8 reviews
    const shuffledCustomers = [...customers].sort(() => 0.5 - Math.random());
    const shuffledComments  = [...COMMENTS].sort(() => 0.5 - Math.random());

    for (let rIdx = 0; rIdx < numReviews; rIdx++) {
      const reviewer   = shuffledCustomers[rIdx % shuffledCustomers.length];
      const commentObj = shuffledComments[rIdx % shuffledComments.length];
      await prisma.reviews.create({
        data: {
          user_id: reviewer.user_id,
          hotel_id: createdHotel.hotel_id,
          rating: commentObj.rating,
          comment: commentObj.text,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)
        }
      });
    }

    console.log(`  [${++hotelCount}/${HOTELS_DATA.length}] ✅ ${createdHotel.hotel_name} (${createdHotel.city}) — ${createdHotel.rooms.length} phòng, ${numReviews} đánh giá`);
  }

  // 8. Tạo Bookings + Payments mẫu (120 booking phân bổ ngẫu nhiên cho các khoảng thời gian)
  console.log("\nĐang tạo dữ liệu đặt phòng và thanh toán mẫu phong phú...");
  const PAYMENT_METHODS = ['QR/VNPay', 'Visa/Mastercard', 'Tại quầy'];
  const BOOKING_STATUSES = [0, 1, 2, 3]; // 0: Chờ, 1: Đã TT, 2: Hoàn thành, 3: Huỷ

  let bookingCount = 0;
  for (let i = 0; i < 120; i++) {
    const customer = customers[i % customers.length];
    const room     = createdRooms[Math.floor(Math.random() * createdRooms.length)];
    const nights   = Math.floor(Math.random() * 4) + 1; // 1-4 đêm

    let createdAtDate = new Date();
    if (i < 20) {
      // Hôm nay
      createdAtDate = new Date();
    } else if (i < 50) {
      // Trong tuần này (1-5 ngày trước)
      createdAtDate = new Date(Date.now() - Math.floor(Math.random() * 5 + 1) * 24 * 60 * 60 * 1000);
    } else if (i < 90) {
      // Trong tháng này (6-25 ngày trước)
      createdAtDate = new Date(Date.now() - Math.floor(Math.random() * 20 + 6) * 24 * 60 * 60 * 1000);
    } else {
      // Cả năm
      createdAtDate = new Date(Date.now() - Math.floor(Math.random() * 120 + 30) * 24 * 60 * 60 * 1000);
    }

    const checkInDate   = new Date(createdAtDate.getTime() + 24 * 60 * 60 * 1000);
    const checkOutDate  = new Date(checkInDate.getTime() + nights * 24 * 60 * 60 * 1000);
    const totalPrice    = room.price_per_night * nights;
    const bookingStatus = BOOKING_STATUSES[Math.floor(Math.random() * BOOKING_STATUSES.length)];

    try {
      const booking = await prisma.bookings.create({
        data: {
          user_id:     customer.user_id,
          room_id:     room.room_id,
          guest_count: Math.floor(Math.random() * 3) + 1,
          check_in:    checkInDate,
          check_out:   checkOutDate,
          total_price: totalPrice,
          status:      bookingStatus,
          created_at:  createdAtDate
        }
      });

      if (bookingStatus !== 0) {
        await prisma.payments.create({
          data: {
            booking_id:       booking.booking_id,
            amount:           totalPrice,
            payment_method:   PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
            transaction_code: `TXN-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
            status:           bookingStatus === 3 ? 2 : 1,
            paid_at:          new Date(booking.created_at.getTime() + 30 * 60 * 1000)
          }
        });
      }
      bookingCount++;
    } catch (err) {
      console.warn(`  ⚠️ Bỏ qua booking ${i + 1}: ${err.message.substring(0, 80)}`);
    }
  }

  console.log(`✅ Đã tạo ${bookingCount}/120 booking và payment mẫu.`);

  // 11. Tạo mẫu Vouchers cho Admin và Khách sạn
  console.log("⏳ Đang tạo dữ liệu Vouchers mẫu...");
  await prisma.vouchers.deleteMany();
  const sampleVouchers = [
    {
      code: "GLOBAL20",
      discount_type: "PERCENT",
      discount_value: 20,
      min_order_value: 1000000,
      max_discount: 500000,
      start_date: new Date(),
      end_date: new Date(Date.now() + 60 * 24 * 3600 * 1000),
      usage_limit: 500,
      used_count: 12,
      hotel_id: null,
      status: 1
    },
    {
      code: "WELCOME500K",
      discount_type: "FIXED",
      discount_value: 500000,
      min_order_value: 3000000,
      max_discount: 500000,
      start_date: new Date(),
      end_date: new Date(Date.now() + 90 * 24 * 3600 * 1000),
      usage_limit: 200,
      used_count: 5,
      hotel_id: null,
      status: 1
    },
    {
      code: "MELIA15",
      discount_type: "PERCENT",
      discount_value: 15,
      min_order_value: 2000000,
      max_discount: 1000000,
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      usage_limit: 100,
      used_count: 3,
      hotel_id: createdHotels[0]?.hotel_id || null,
      status: 1
    },
    {
      code: "METROPOLE10",
      discount_type: "PERCENT",
      discount_value: 10,
      min_order_value: 5000000,
      max_discount: 2000000,
      start_date: new Date(),
      end_date: new Date(Date.now() + 45 * 24 * 3600 * 1000),
      usage_limit: 50,
      used_count: 1,
      hotel_id: createdHotels[1]?.hotel_id || null,
      status: 1
    }
  ];

  for (const v of sampleVouchers) {
    await prisma.vouchers.create({ data: v });
  }
  console.log(`✅ Đã tạo ${sampleVouchers.length} Vouchers mẫu thành công!`);

  // Tổng kết
  console.log("\n==================================================");
  console.log(`🎉 HOÀN TẤT SEEDING! Tổng kết:`);
  console.log(`   📍 ${hotelCount} khách sạn tại 8 thành phố`);
  console.log(`   🛏️  ${createdRooms.length} phòng (kèm ảnh & tiện nghi)`);
  console.log(`   👥 ${customers.length} khách hàng mẫu`);
  console.log(`   📝 ~${hotelCount * 6} đánh giá phong phú`);
  console.log(`   📅 ${bookingCount} đặt phòng & thanh toán`);
  console.log(`   🎟️  ${sampleVouchers.length} mã ưu đãi / voucher`);
  console.log(`   💎 ${createdAmenities.length} loại tiện nghi`);
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
