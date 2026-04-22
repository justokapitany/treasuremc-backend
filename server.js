const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const app = express();

// 🔥 CORS FIX
app.use(cors({
  origin: [
    "https://treasuremc.vercel.app",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ]
}));

app.use(express.json());

// 🔥 FONTOS (Render miatt)
const PORT = process.env.PORT || 5000;

// MongoDB kapcsolat
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model("User", userSchema);

// TEST
app.get("/", (req, res) => {
  res.send("Backend működik 🚀");
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email már létezik" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed
    });

    await user.save();

    res.json({ message: "Sikeres regisztráció" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Szerver hiba" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Nincs ilyen user" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Hibás jelszó" });

    res.json({
      message: "Sikeres login",
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Szerver hiba" });
  }
});

app.listen(PORT, () => {
  console.log("Server fut:", PORT);
});