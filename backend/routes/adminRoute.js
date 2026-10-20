const express = require("express");

const {
  loginAdmin,
  getAdminDashboard,
  getAllUsers,
  getUserById,
  getalljobs,
  jobDetails,
  jobDelete,
  allCompany,
  companyDetails,
  getAllApplications,
  getApplicationById,
} = require("../controllers/adminController");

const adminAuth = require("../middleware/adminAuth");

const adminRoute = express.Router();

// Admin authentication
adminRoute.post("/login", loginAdmin);

// Dashboard
adminRoute.get("/dashboard", adminAuth, getAdminDashboard);

// Users
adminRoute.get("/getalluser", adminAuth, getAllUsers);
adminRoute.get("/user/:id", adminAuth, getUserById);

// Jobs
adminRoute.get("/alljobs", adminAuth, getalljobs);
adminRoute.get("/job/:id", adminAuth, jobDetails);
adminRoute.delete("/jobs/:id", adminAuth, jobDelete);

// Companies
adminRoute.get("/allCompanies", adminAuth, allCompany);
adminRoute.get("/company/:id", adminAuth, companyDetails);

// Applications
adminRoute.get("/applications", adminAuth, getAllApplications);
adminRoute.get("/applications/:id", adminAuth, getApplicationById);

module.exports = adminRoute;
