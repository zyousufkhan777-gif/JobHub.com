const express = require("express");

const {
  createApplication,
  getApplicationByUser,
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");

const applicationRoute = express.Router();

applicationRoute.post("/create", authMiddleware, createApplication);

applicationRoute.get("/my-applications", authMiddleware, getApplicationByUser);

module.exports = applicationRoute;
