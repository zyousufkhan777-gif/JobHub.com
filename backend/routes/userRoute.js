const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

const {
  UpdateProfile,
  getallJob,
  jobDetails,
  getallCompanies,
  companyDetails,
} = require("../controllers/userController");

const userRoute = express.Router();

// Update user profile
userRoute.post(
  "/updateprofile",
  authMiddleware,
  upload.single("profilePhoto"),
  UpdateProfile,
);

// Get all jobs
userRoute.get("/getjobs", getallJob);

// Get job details by ID
userRoute.get("/getjobs/:id", jobDetails);

// Get all active companies
userRoute.get("/getcompanies", getallCompanies);

// Get company details by ID
userRoute.get("/getcompanies/:id", companyDetails);

module.exports = userRoute;
