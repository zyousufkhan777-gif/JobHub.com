const express = require("express");

const {
  register,
  login,
  googleLogin,
  sendOtp,
  verifyOtp,
  getMe
} = require("../controllers/AuthController");
const authMiddleware = require("../middleware/authMiddleware");

const authRoute = express.Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.post("/google", googleLogin);
authRoute.post("/sendOtp", sendOtp);
authRoute.post("/verifyOtp", verifyOtp);
authRoute.get('/me' , authMiddleware , getMe)

module.exports = authRoute;
