// prisma/seed_hotels.js - Chay: node prisma/seed_hotels.js
const prisma = require('../src/configs/database.js');

async function main() {
  console.log("Bat dau seed khach san mau...");

  let owner = await prisma.users.findUnique({ where: { email: 'owner@travelbooking.com' } });
  if (!owner) {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('123456', 10);
    owner = await prisma.users.create({
      data: { full_name: 'Hotel Owner', email: 'owner@travelbooking.com', password: hash, role: 1 }
    });
  }

  const ts = Date.now();
  const rt1 = await prisma.room_types.create({ data: { type_name: 'Tieu Chuan '+ts, description: 'Phong tieu chuan', max_guest: 2 } });
  const rt2 = await prisma.room_types.create({ data: { type_name: 'Deluxe '+ts, description: 'Phong deluxe cao cap', max_guest: 2 } });
  const rt3 = await prisma.room_types.create({ data: { type_name: 'Suite '+ts, description: 'Phong suite', max_guest: 4 } });

  const hotels = [
    { name:'Ha Noi Heritage Grand', phone:'02412345678', address:'10 Pho Co Thu', city:'Ha Noi', desc:'Khach san 5 sao o trung tam Ha Noi voi kien truc Phap co dien. Nhin thang ra Ho Guom lung danh.', stars:5, imgs:['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80','https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&q=80'], rooms:[{rt:rt2.room_type_id,num:'201',price:3500000},{rt:rt3.room_type_id,num:'501',price:7500000},{rt:rt1.room_type_id,num:'101',price:1800000}] },
    { name:'Da Nang Beachfront Paradise', phone:'02367890123', address:'99 Vo Nguyen Giap', city:'Da Nang', desc:'Resort 5 sao ngay tren bai bien My Khe dep nhat Dong Nam A. Ho boi vo tan nhin ra bien.', stars:5, imgs:['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80','https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80'], rooms:[{rt:rt2.room_type_id,num:'301',price:4200000},{rt:rt3.room_type_id,num:'601',price:9800000},{rt:rt1.room_type_id,num:'201',price:2200000}] },
    { name:'Hoi An Ancient Boutique Hotel', phone:'02353456789', address:'25 Nguyen Thai Hoc', city:'Hoi An', desc:'Khach san boutique trong pho co Hoi An UNESCO. Pha tron kien truc co xua voi tien nghi hien dai.', stars:4, imgs:['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'], rooms:[{rt:rt2.room_type_id,num:'101',price:2800000},{rt:rt1.room_type_id,num:'102',price:1500000},{rt:rt3.room_type_id,num:'201',price:5500000}] },
    { name:'Phu Quoc Pearl Island Resort', phone:'02973210987', address:'88 Tran Hung Dao', city:'Phu Quoc', desc:'Resort sang trong ben bo bien xanh Phu Quoc - dao Ngoc. Biet thu rieng co ho boi va bai bien rieng tu.', stars:5, imgs:['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80'], rooms:[{rt:rt3.room_type_id,num:'Villa1',price:12000000},{rt:rt2.room_type_id,num:'401',price:5800000}] },
    { name:'Nha Trang Bay Luxury Hotel', phone:'02583456789', address:'05 Tran Phu', city:'Nha Trang', desc:'Khach san 5 sao toa lac tren con pho bien Tran Phu. Nhin thang ra Vinh Nha Trang tuyet dep.', stars:5, imgs:['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'], rooms:[{rt:rt2.room_type_id,num:'501',price:3800000},{rt:rt1.room_type_id,num:'301',price:1900000},{rt:rt3.room_type_id,num:'701',price:8500000}] },
    { name:'Sapa Misty Cloud Resort', phone:'02143210654', address:'Dinh Deo O Quy Ho', city:'Sapa', desc:'Khu nghi duong an minh trong may tren dinh Sapa. Nhin thay ruong bac thang ky vi tu ban cong.', stars:4, imgs:['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'], rooms:[{rt:rt2.room_type_id,num:'201',price:2500000},{rt:rt1.room_type_id,num:'101',price:1200000},{rt:rt3.room_type_id,num:'301',price:4800000}] },
    { name:'Ha Noi Silk Business Hotel', phone:'02432109876', address:'45 Ba Trieu', city:'Ha Noi', desc:'Khach san 3 sao tien nghi danh cho doanh nhan. Vi tri trung tam, wifi toc do cao.', stars:3, imgs:['https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80'], rooms:[{rt:rt1.room_type_id,num:'101',price:850000},{rt:rt1.room_type_id,num:'102',price:850000},{rt:rt2.room_type_id,num:'201',price:1400000}] },
    { name:'Da Nang City Center Hotel', phone:'02367123456', address:'18 Le Loi', city:'Da Nang', desc:'Khach san 3 sao o trung tam Da Nang. Di bo den cau Rong chi 10 phut.', stars:3, imgs:['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'], rooms:[{rt:rt1.room_type_id,num:'101',price:750000},{rt:rt2.room_type_id,num:'201',price:1200000}] },
    { name:'Phu Quoc Eco Beach Bungalow', phone:'02973987654', address:'12 Duong Bao Beach', city:'Phu Quoc', desc:'Khu nghi duong bungalow sinh thai ngay sat bien. Top 1 TripAdvisor cho gia dinh co tre em.', stars:4, imgs:['https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?w=800&q=80'], rooms:[{rt:rt2.room_type_id,num:'Bungalow1',price:3200000},{rt:rt3.room_type_id,num:'FamilyVilla',price:6500000}] },
    { name:'Hoi An Garden Hotel & Spa', phone:'02353234567', address:'78 Hai Ba Trung', city:'Hoi An', desc:'Khach san 4 sao co vuon hoa lang man giua pho co. Spa cao cap su dung nguyen lieu thien nhien.', stars:4, imgs:['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80'], rooms:[{rt:rt2.room_type_id,num:'201',price:2200000},{rt:rt1.room_type_id,num:'101',price:1100000},{rt:rt3.room_type_id,num:'301',price:4200000}] }
  ];

  let count = 0;
  for (const h of hotels) {
    const created = await prisma.hotels.create({
      data: {
        owner_id: owner.user_id,
        hotel_name: h.name,
        phone: h.phone,
        address: h.address,
        city: h.city,
        description: h.desc,
        star_rating: h.stars,
        status: 1,
        payment_status: 1,
        hotel_images: { create: h.imgs.map(url => ({ image_url: url })) },
        rooms: { create: h.rooms.map(r => ({ room_type_id: r.rt, room_number: r.num, price_per_night: r.price, status: 0 })) }
      }
    });
    console.log(`  [${++count}] Tao: ${created.hotel_name} (${created.city}) - ${h.stars} sao`);
  }

  console.log(`\nHOAN TAT: Da tao ${count} khach san moi!`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
