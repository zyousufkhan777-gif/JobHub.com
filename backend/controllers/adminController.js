const mongoose = require("mongoose");
const AdminModel = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/UserModel");
const CompanyModel = require("../models/CompanyModel");
const JobModel = require("../models/JobModel");
const ApplicationModel = require("../models/ApplicationModel");

// Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin
    const admin = await AdminModel.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password with hashed password in database
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    // Generate token
    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Dashboard API //

const getAdminDashboard = async (req, res) => {
  try {
    const user = await UserModel.countDocuments();

    const companies = await CompanyModel.countDocuments();

    const jobs = await JobModel.countDocuments();

    const applications = await ApplicationModel.countDocuments();

    return res.status(200).json({
      success: true,
      dashboard: {
        totalUsers: user,
        totalCompanies: companies,
        totalJobs: jobs,
        totalApplications: applications,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get admin dashboard",
    });
  }
};

// get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find()
      .select("-password -passwordHash")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// get user by id
// Get user details by ID (Admin)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id).select("-password -passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    console.error("Get User By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// get all jobs
const getalljobs = async (req, res) => {
  try {
    const jobs = await JobModel.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// Get job details by ID (Admin)
const jobDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await JobModel.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Get Job Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job",
    });
  }
};

// Delete job

const jobDelete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await JobModel.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    await JobModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
    });
  }
};

// get all company

const allCompany = async (req, res) => {
  try {
    const companies = await CompanyModel.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      totalCompanies: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Get All Companies Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
    });
  }
};

// get company by id

const companyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate company ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
    }

    // Find company by ID
    const company = await CompanyModel.findById(id);

    // Check if company exists
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Return company details
    return res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Get Company Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company details",
    });
  }
};

// get All applications

const getAllApplications = async (req, res) => {
  try {
    const applications = await ApplicationModel.find()
      .populate("user", "-password -passwordHash")
      .populate("job")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalApplications: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get All Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

// get company by id

const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate application ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    // Find application by ID
    const application = await ApplicationModel.findById(id)
      .populate("user", "-password -passwordHash")
      .populate("job");

    // Check if application exists
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get Application Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application details",
    });
  }
};

module.exports = {
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
};
