import express from "express";
import User from "./models/users.models.js";
import db from "./dbs/db.js";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

cloudinary.config({
  cloud_name:process.env.cloud_name,
  api_key:process.env.api_key,
  api_secret:process.env.api_secret
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "pdf"]
  }
});

const upload = multer({ storage });

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
  try {
    const { name, gmail, password } = req.body;

    if (!name || !gmail || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ gmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      gmail,
      password: hashedPassword,
      uniqueid: `${name}_${Date.now()}`
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
  try {
    const { gmail, password } = req.body;

    if (!gmail || !password) {
      return res.status(400).json({ message: "Credentials missing" })
    }

    const user = await User.findOne({ gmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= PROTECTED DASHBOARD =================
app.post("/api/dashboard", upload.single("file"), (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.status(200).json({
    message: "File uploaded successfully",
    file: req.file.filename
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
