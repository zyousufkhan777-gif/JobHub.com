const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/UserModel");

require("../config/firebaseAdmin");

const { getAuth } = require("firebase-admin/auth");
const nodemailer = require("nodemailer");

// ===============================
// Register
// POST /api/auth/register
// ===============================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required!",
      });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email!",
      });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters!",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists!",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully! Please verify your email with OTP.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// API Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing Details!",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist!",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials!",
      });
    }

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Google Login
// POST /api/auth/google
// ===============================

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required.",
      });
    }

    // Verify Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);

    const { uid, email, name, picture } = decodedToken;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "A valid email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email: normalizedEmail,
        password: `google_${uid}`,
        profilePhoto: picture || "",
        isVerified: true,
        role: "user",
      });
    } else {
      let changed = false;

      if (picture && !user.profilePhoto) {
        user.profilePhoto = picture;
        changed = true;
      }

      if (name && !user.name) {
        user.name = name;
        changed = true;
      }

      if (!user.isVerified) {
        user.isVerified = true;
        changed = true;
      }

      if (changed) {
        await user.save();
      }
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    // Log the real error on the backend
    console.error("Google Login Error:", error.code, error.message);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed. Check backend logs.",
    });
  }
};

// ===============================
// Send OTP
// POST /api/auth/send-otp
// ===============================
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required!",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist!",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires after 5 minutes
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;

    await user.save();

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"JobHub" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "JobHub Verification Code",
      text: `Your JobHub verification code is: ${otp}. This code expires in 5 minutes.`,
      html: `
        <h2>JobHub Verification</h2>
        <p>Your verification code is:</p>
        <h1>${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully!",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP!",
    });
  }
};

// ===============================
// Verify OTP
// POST /api/auth/verify-otp
// ===============================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check details
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required!",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Check if OTP exists
    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP!",
      });
    }

    // Check OTP expiration
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      user.otp = null;
      user.otpExpiresAt = null;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP!",
      });
    }

    // Check OTP
    if (user.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP!",
      });
    }

    // Verify user
    user.isVerified = true;

    // Remove OTP
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Success response
    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get Current User
// GET /api/auth/me
// ===============================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -otp -otpExpiresAt",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  sendOtp,
  verifyOtp,
  getMe,
};
