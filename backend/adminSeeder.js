require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/Mongodb");
const AdminModel = require("./models/adminModel");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is missing from .env");
    }

    if (!process.env.ADMIN_PASSWORD) {
      throw new Error("ADMIN_PASSWORD is missing from .env");
    }

    await connectDB();

    const email = "admin@gmail.com";

    const admin = await AdminModel.findOne({ email });

    if (admin) {
      console.log("Admin already exists");
      return;
    }

    const hashPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

    const adminCreate = await AdminModel.create({
      name: "Admin",
      email,
      password: hashPassword,
    });

    console.log("Admin created successfully");
    console.log("Admin email:", adminCreate.email);
  } catch (error) {
    console.error("Admin seeder failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();
