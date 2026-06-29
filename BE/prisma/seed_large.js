// prisma/seed_large.js - Run with: node prisma/seed_large.js
const prisma = require('../src/configs/database.js');
const bcrypt = require('bcrypt');

async function main() {
  console.log("=== BẮT ĐẦU SEED DỮ LIỆU LỚN CHO TRAVELBOOKING ===");

  // 1. Dọn sạch dữ liệu cũ để tránh trùng lặp/rác (Theo thứ tự quan hệ khóa ngoại)
  console.log("Dọn dẹp các bảng cũ...");
  await prisma.payments.deleteMany({});
  await prisma.bookings.deleteMany({});
  await prisma.reviews.deleteMany({});
  await prisma.room_images.deleteMany({});
  await prisma.rooms.deleteMany({});
  await prisma.hotel_images.deleteMany({});
  await prisma.hotels.deleteMany({});
  
  // Xóa bớt room_type_amenities và room_types cũ
  await prisma.room_type_amenities.deleteMany({});
  await prisma.room_types.deleteMany({});

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

  // Tạo danh sách khách hàng để viết review chân thực
  const customers = [];
  const customerData = [
    { name: 'Trần Thanh Sơn', email: 'son.tran@gmail.com' },
    { name: 'Nguyễn Bích Phương', email: 'phuong.nguyen@gmail.com' },
    { name: 'Lê Minh Triết', email: 'triet.le@gmail.com' },
    { name: 'Phạm Kiều Trang', email: 'trang.pham@gmail.com' },
    { name: 'Hoàng Anh Tuấn', email: 'tuan.hoang@gmail.com' },
    { name: 'Vũ Thùy Linh', email: 'linh.vu@gmail.com' }
  ];

  for (const c of customerData) {
    const user = await prisma.users.upsert({
      where: { email: c.email },
      update: {},
      create: { full_name: c.name, email: c.email, password: passwordHash, phone: '0987654321', role: 0 }
    });
    customers.push(user);
  }
  console.log(`✅ Đã thiết lập ${customers.length} người dùng mẫu.`);

  // 3. Tạo Room Types chính thức
  console.log("Đang tạo các loại phòng...");
  const rtDeluxe = await prisma.room_types.create({
    data: { type_name: 'Deluxe Suite', description: 'Phòng deluxe cao cấp, view đẹp rộng rãi', max_guest: 2 }
  });
  const rtSuiteJunior = await prisma.room_types.create({
    data: { type_name: 'Suite Junior', description: 'Phòng Suite Junior sang trọng cho cặp đôi', max_guest: 2 }
  });
  const rtSuiteGrand = await prisma.room_types.create({
    data: { type_name: 'Suite Grand', description: 'Phòng Suite Grand thượng hạng đẳng cấp bậc nhất', max_guest: 4 }
  });
  const rtStandard = await prisma.room_types.create({
    data: { type_name: 'Standard Room', description: 'Phòng tiêu chuẩn ấm cúng đầy đủ tiện nghi', max_guest: 2 }
  });

  // Hình ảnh chất lượng cao từ Unsplash theo chủ đề thành phố/resort
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

  // Danh sách đánh giá sinh ngẫu nhiên phong phú
  const COMMENTS = [
    { rating: 5, text: "Khách sạn quá tuyệt vời! Phòng ốc rộng rãi, dịch vụ 5 sao chuẩn mực." },
    { rating: 5, text: "Nhân viên thân thiện, đồ ăn sáng buffet rất phong phú và ngon miệng!" },
    { rating: 4, text: "Vị trí vô cùng đắc địa, đi lại thuận tiện. View ngắm cảnh rất đẹp." },
    { rating: 4, text: "Phòng đẹp, sạch sẽ, hồ bơi vô cực ngắm hoàng hôn rất chill." },
    { rating: 5, text: "Kỳ nghỉ đáng nhớ cho cả gia đình tôi. Sẽ quay lại lần sau!" },
    { rating: 3, text: "Khách sạn tốt nhưng giá hơi cao vào dịp cuối tuần." },
    { rating: 4, text: "Không gian yên tĩnh, lãng mạn thích hợp nghỉ dưỡng." }
  ];

  // Danh sách 30 khách sạn trải dài các thành phố du lịch hàng đầu Việt Nam
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
      rooms: [
        { rt: rtDeluxe.room_type_id, num: "801", price: 3200000 },
        { rt: rtSuiteJunior.room_type_id, num: "902", price: 4500000 },
        { rt: rtSuiteGrand.room_type_id, num: "1203", price: 7800000 }
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
      rooms: [
        { rt: rtSuiteJunior.room_type_id, num: "Classic-101", price: 6500000 },
        { rt: rtSuiteGrand.room_type_id, num: "Opera-302", price: 11000000 },
        { rt: rtDeluxe.room_type_id, num: "Premium-205", price: 5200000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "W-105", price: 2900000 },
        { rt: rtDeluxe.room_type_id, num: "W-204", price: 3900000 },
        { rt: rtSuiteGrand.room_type_id, num: "W-310", price: 8500000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "M-101", price: 1600000 },
        { rt: rtDeluxe.room_type_id, num: "M-202", price: 2300000 }
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
      rooms: [
        { rt: rtSuiteJunior.room_type_id, num: "Resort-Classic", price: 9500000 },
        { rt: rtSuiteGrand.room_type_id, num: "Atrium-Suite", price: 15000000 },
        { rt: rtDeluxe.room_type_id, num: "Ocean-Villa", price: 22000000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "H-102", price: 3400000 },
        { rt: rtDeluxe.room_type_id, num: "H-204", price: 4600000 },
        { rt: rtSuiteGrand.room_type_id, num: "V-VIP1", price: 12500000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "Han-1201", price: 2100000 },
        { rt: rtDeluxe.room_type_id, num: "Han-1502", price: 3200000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "ALC-405", price: 1550000 },
        { rt: rtDeluxe.room_type_id, num: "ALC-708", price: 2250000 }
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
      rooms: [
        { rt: rtDeluxe.room_type_id, num: "V-201", price: 3800000 },
        { rt: rtSuiteJunior.room_type_id, num: "V-305", price: 5000000 },
        { rt: rtSuiteGrand.room_type_id, num: "Villa-3Chamber", price: 9200000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "S-1402", price: 2400000 },
        { rt: rtDeluxe.room_type_id, num: "S-1805", price: 3400000 },
        { rt: rtSuiteGrand.room_type_id, num: "S-Executive", price: 7200000 }
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
      rooms: [
        { rt: rtDeluxe.room_type_id, num: "Ocean-Villa-1", price: 4800000 },
        { rt: rtSuiteGrand.room_type_id, num: "Family-Villa-2", price: 8900000 }
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
      rooms: [
        { rt: rtSuiteJunior.room_type_id, num: "Emerald-101", price: 8200000 },
        { rt: rtSuiteGrand.room_type_id, num: "Grand-Lamarck", price: 14000000 },
        { rt: rtDeluxe.room_type_id, num: "Rue-de-Lamarck", price: 6800000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "IC-302", price: 3800000 },
        { rt: rtDeluxe.room_type_id, num: "IC-504", price: 5200000 },
        { rt: rtSuiteGrand.room_type_id, num: "IC-Suite-10", price: 9500000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "N-201", price: 1900000 },
        { rt: rtDeluxe.room_type_id, num: "N-Villa-5", price: 4200000 }
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
      rooms: [
        { rt: rtDeluxe.room_type_id, num: "River-101", price: 4600000 },
        { rt: rtSuiteJunior.room_type_id, num: "River-202", price: 6200000 }
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
      rooms: [
        { rt: rtSuiteJunior.room_type_id, num: "V-1Bedroom", price: 18000000 },
        { rt: rtSuiteGrand.room_type_id, num: "V-3Bedroom", price: 35000000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "M-105", price: 1350000 },
        { rt: rtDeluxe.room_type_id, num: "M-308", price: 2100000 }
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
      rooms: [
        { rt: rtDeluxe.room_type_id, num: "P-101", price: 3500000 },
        { rt: rtSuiteJunior.room_type_id, num: "P-202", price: 4900000 },
        { rt: rtSuiteGrand.room_type_id, num: "P-Royal", price: 9000000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "Villa-6-1", price: 2100000 },
        { rt: rtDeluxe.room_type_id, num: "Villa-9-2", price: 3300000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "SBL-302", price: 1450000 },
        { rt: rtDeluxe.room_type_id, num: "SBL-506", price: 2200000 }
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
      rooms: [
        { rt: rtDeluxe.room_type_id, num: "Coup-305", price: 3600000 },
        { rt: rtSuiteJunior.room_type_id, num: "Coup-502", price: 5400000 },
        { rt: rtSuiteGrand.room_type_id, num: "Coup-Pres", price: 9900000 }
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
      rooms: [
        { rt: rtDeluxe.room_type_id, num: "Bung-15", price: 5800000 },
        { rt: rtSuiteJunior.room_type_id, num: "Bung-VIP", price: 8200000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "P-401", price: 1600000 },
        { rt: rtDeluxe.room_type_id, num: "P-602", price: 2500000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "Imp-102", price: 2500000 },
        { rt: rtDeluxe.room_type_id, num: "Imp-305", price: 3800000 },
        { rt: rtSuiteGrand.room_type_id, num: "Imp-Royal", price: 8200000 }
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
      rooms: [
        { rt: rtDeluxe.room_type_id, num: "MB-201", price: 3100000 },
        { rt: rtSuiteJunior.room_type_id, num: "MB-502", price: 4600000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "P-1015", price: 2200000 },
        { rt: rtDeluxe.room_type_id, num: "P-1420", price: 3200000 }
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
      rooms: [
        { rt: rtStandard.room_type_id, num: "Vias-305", price: 1400000 },
        { rt: rtDeluxe.room_type_id, num: "Vias-508", price: 2150000 }
      ]
    }
  ];

  let count = 0;
  for (const h of HOTELS_DATA) {
    // Lấy pool ảnh tương ứng
    const imgUrls = IMAGES_POOL[h.pool] || IMAGES_POOL.hanoi;
    
    const createdHotel = await prisma.hotels.create({
      data: {
        owner_id: ownerUser.user_id,
        hotel_name: h.name,
        phone: h.phone,
        address: h.address,
        city: h.city,
        description: h.description,
        star_rating: h.star_rating,
        status: 1,
        payment_status: 1,
        // Đưa ảnh vào quan hệ hotel_images
        hotel_images: {
          create: imgUrls.map(url => ({ image_url: url }))
        },
        // Tạo phòng tương ứng
        rooms: {
          create: h.rooms.map((r, i) => ({
            room_type_id: r.rt,
            room_number: r.num,
            price_per_night: r.price,
            status: 0
          }))
        }
      }
    });

    // 4. Tạo reviews chân thực ngẫu nhiên từ danh sách khách hàng
    const numReviews = Math.floor(Math.random() * 4) + 3; // 3 - 6 reviews mỗi hotel
    const shuffledCustomers = [...customers].sort(() => 0.5 - Math.random());
    const shuffledComments = [...COMMENTS].sort(() => 0.5 - Math.random());

    for (let rIdx = 0; rIdx < numReviews; rIdx++) {
      const reviewer = shuffledCustomers[rIdx % shuffledCustomers.length];
      const commentObj = shuffledComments[rIdx % shuffledComments.length];
      
      await prisma.reviews.create({
        data: {
          user_id: reviewer.user_id,
          hotel_id: createdHotel.hotel_id,
          rating: commentObj.rating,
          comment: commentObj.text,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Ngẫu nhiên trong 30 ngày qua
        }
      });
    }

    console.log(`  [${++count}/27] Đã tạo thành công: ${createdHotel.hotel_name} (${createdHotel.city})`);
  }

  console.log("==================================================");
  console.log(`🎉 HOÀN TẤT SEEDING! Tổng cộng đã tạo ${count} khách sạn phong phú kèm phòng & đánh giá!`);
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
