require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");
const startBot = require("./bot/bot");

const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const chatRoutes = require("./routes/chat.routes");
const pageRoutes = require("./routes/page.routes");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const cartRoutes = require("./routes/cart.routes");

const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super_secret_key",
    store: new SequelizeStore({
      db: sequelize,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 hari
  })
);

// Global middleware for templates
app.use((req, res, next) => {
  res.locals.user = req.session;
  res.locals.cartCount = req.session.cart ? Object.values(req.session.cart).reduce((a,b)=>a+b, 0) : 0;
  next();
});

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/cart", cartRoutes);
app.use("/", pageRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Koneksi database berhasil");

    await sequelize.sync();
    console.log("Sync model selesai");

    // Express (halaman web tempat user belanja) dan bot Telegram (khusus
    // admin) jalan BARENG dalam 1 process, sama-sama manggil service
    // layer yang sama (liat services/)
    app.listen(PORT, () => {
      console.log(`Server web jalan di http://localhost:${PORT}`);
    });

    startBot();
  } catch (err) {
    console.error("Gagal konek ke database:", err.message);
  }
}

start();
