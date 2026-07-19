const p = require('./src/configs/database');
const bcrypt = require('bcrypt');

(async () => {
  const users = await p.users.findMany({
    where: {
      email: {
        in: [
          'admin@travelbooking.com',
          'owner@travelbooking.com',
          'customer@travelbooking.com',
          'admin@gmail.com',
          'anhhao2026_admin@gmail.com',
          'vana@gmail.com'
        ]
      }
    }
  });

  for (let x of users) {
    const is123456 = await bcrypt.compare('123456', x.password);
    const isAdmin = await bcrypt.compare('admin', x.password);
    const isAdmin123 = await bcrypt.compare('admin123', x.password);
    const is123 = await bcrypt.compare('123', x.password);
    console.log(`${x.email} | role: ${x.role} | 123456: ${is123456} | admin: ${isAdmin} | admin123: ${isAdmin123} | 123: ${is123}`);
  }
  process.exit(0);
})();
