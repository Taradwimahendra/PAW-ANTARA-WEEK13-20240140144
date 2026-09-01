require('dotenv').config();
const { sequelize, Product, User } = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Koneksi database berhasil');
    
    // Force sync for this assignment to make sure db schema is clean
    await sequelize.sync({ force: true });

    // Seed Users
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.bulkCreate([
      { username: 'admin', password: passwordHash, role: 'admin' },
      { username: 'customer', password: passwordHash, role: 'customer' }
    ]);
    console.log('User Admin & Customer berhasil dibuat (password: password123)');

    // Seed Products (Banyak data)
    const dummyProducts = [];
    for (let i = 1; i <= 25; i++) {
      dummyProducts.push({
        name: `Produk Baju/Sepatu ${i}`,
        description: `Deskripsi produk ${i} yang sangat keren dan berkualitas tinggi. Bahan sangat nyaman dipakai sehari-hari.`,
        price: 50000 + (Math.floor(Math.random() * 10) * 10000),
        stock: 10 + Math.floor(Math.random() * 50)
      });
    }
    // Add specific items for AI demo compatibility if needed
    dummyProducts.push({
      name: 'Kaos Polos A',
      description: 'Bahan cotton combed 30s, adem, tersedia warna hitam & putih. Cocok buat harian, harga lebih terjangkau.',
      price: 75000,
      stock: 50,
    });
    dummyProducts.push({
      name: 'Kaos Polos B',
      description: 'Bahan cotton combed 24s (lebih tebal & premium dari versi A), tersedia warna navy & maroon. Lebih awet, harga sedikit lebih tinggi.',
      price: 95000,
      stock: 30,
    });

    await Product.bulkCreate(dummyProducts);
    console.log(`Berhasil menambahkan ${dummyProducts.length} produk dummy.`);

    console.log('\nSeeding selesai ✅');
    process.exit(0);
  } catch (err) {
    console.error('Gagal seeding:', err.message);
    process.exit(1);
  }
}

seed();
