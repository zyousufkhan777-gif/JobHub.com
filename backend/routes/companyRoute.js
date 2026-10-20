const express = require("express");
const upload = require("../middleware/multer");

const {
  registerCompany,
  loginCompany,
  createCompany,
  getMyCompany,
  updateCompanyProfile,
  searchCompanies,
  dashboard,
} = require("../controllers/CompanyController");

const companyMiddleware = require("../middleware/companyMiddleware");

const companyRoute = express.Router();

// Search companies
companyRoute.get("/search", searchCompanies);

// Register company account
companyRoute.post("/register", registerCompany);

// Login company account
companyRoute.post("/login", loginCompany);

// Create company profile
companyRoute.post(
  "/create",
  companyMiddleware,
  upload.single("logo"),
  createCompany,
);

// Company Dashboard
companyRoute.get("/dashboard", companyMiddleware, dashboard);

// Get authenticated company profile
companyRoute.get("/me", companyMiddleware, getMyCompany);

// Update company profile
companyRoute.post(
  "/profile",
  companyMiddleware,
  upload.single("logo"),
  updateCompanyProfile,
);

module.exports = companyRoute;
