const CompanyModel = require("../models/CompanyModel");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const JobModel = require("../models/JobModel");
const ApplicationsModel = require("../models/ApplicationModel");
// ==========================================
// Helper: Create company JWT
// ==========================================
const createCompanyToken = (company) => {
  return jwt.sign(
    {
      id: company._id.toString(),
      companyId: company._id.toString(),
      role: "company",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// ==========================================
// Register Company
// ==========================================
const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing.");
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingCompany = await CompanyModel.findOne({
      email: normalizedEmail,
    });

    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: "Company already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await CompanyModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = createCompanyToken(company);

    return res.status(201).json({
      success: true,
      message: "Company registered successfully.",
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        role: "company",
      },
    });
  } catch (error) {
    console.error("Company Register Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register company.",
    });
  }
};

// ==========================================
// Login Company
// ==========================================
const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing.");

      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const company = await CompanyModel.findOne({
      email: normalizedEmail,
    });

    if (!company) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, company.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createCompanyToken(company);

    return res.status(200).json({
      success: true,
      message: "Company login successful.",
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        companyName: company.companyName || "",
        role: "company",
      },
    });
  } catch (error) {
    console.error("Company Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to log in.",
    });
  }
};

// ==========================================
// Create Company Profile
// ==========================================
const createCompany = async (req, res) => {
  try {
    const companyId = req.companyId;

    const {
      companyName,
      description,
      website,
      location,
      industry,
      companySize,
      foundedYear,
    } = req.body || {};

    const logo = req.file;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const requiredFields = [
      companyName,
      description,
      location,
      industry,
      companySize,
      foundedYear,
    ];

    if (
      requiredFields.some(
        (field) =>
          field === undefined || field === null || String(field).trim() === "",
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const year = Number(foundedYear);
    const currentYear = new Date().getFullYear();

    if (!Number.isInteger(year) || year < 1800 || year > currentYear) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid founded year.",
      });
    }

    // Website is optional.
    const websiteValue = String(website || "").trim();

    if (websiteValue) {
      try {
        const parsedWebsite = new URL(websiteValue);

        if (
          !["http:", "https:"].includes(parsedWebsite.protocol) ||
          !parsedWebsite.hostname.includes(".")
        ) {
          throw new Error("Invalid website URL.");
        }
      } catch {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid website URL, including https://.",
        });
      }
    }

    if (!logo) {
      return res.status(400).json({
        success: false,
        message: "Please upload a company logo.",
      });
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedMimeTypes.includes(logo.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Logo must be a JPG, PNG, or WEBP image.",
      });
    }

    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    if (company.companyName) {
      return res.status(409).json({
        success: false,
        message: "Company profile already exists.",
      });
    }

    if (!logo.path) {
      return res.status(400).json({
        success: false,
        message: "Uploaded logo file is unavailable.",
      });
    }

    const uploadLogo = await cloudinary.uploader.upload(logo.path, {
      resource_type: "image",
      folder: "jobhub/companies",
    });

    company.companyName = companyName.trim();
    company.description = description.trim();
    company.website = websiteValue;
    company.location = location.trim();
    company.industry = industry.trim();
    company.companySize = companySize.trim();
    company.foundedYear = year;
    company.logo = uploadLogo.secure_url;

    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company profile created successfully.",
      company,
    });
  } catch (error) {
    console.error("Create Company Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create company profile.",
    });
  }
};

// ==========================================
// Get My Company
// ==========================================
const getMyCompany = async (req, res) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const company = await CompanyModel.findById(companyId).select("-password");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    return res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Get My Company Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve company profile.",
    });
  }
};

// ==========================================
// Update Company Profile
// ==========================================
const updateCompanyProfile = async (req, res) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    const {
      companyName,
      description,
      website,
      location,
      industry,
      companySize,
      foundedYear,
    } = req.body || {};

    if (companyName !== undefined) {
      if (!companyName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Company name cannot be empty.",
        });
      }

      company.companyName = companyName.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Description cannot be empty.",
        });
      }

      company.description = description.trim();
    }

    if (website !== undefined) {
      const websiteValue = website.trim();

      if (websiteValue) {
        try {
          const parsedWebsite = new URL(websiteValue);

          if (
            !["http:", "https:"].includes(parsedWebsite.protocol) ||
            !parsedWebsite.hostname.includes(".")
          ) {
            throw new Error("Invalid website URL.");
          }
        } catch {
          return res.status(400).json({
            success: false,
            message: "Please enter a valid website URL.",
          });
        }
      }

      company.website = websiteValue;
    }

    if (location !== undefined) {
      if (!location.trim()) {
        return res.status(400).json({
          success: false,
          message: "Location cannot be empty.",
        });
      }

      company.location = location.trim();
    }

    if (industry !== undefined) {
      company.industry = industry.trim();
    }

    if (companySize !== undefined) {
      company.companySize = companySize.trim();
    }

    if (foundedYear !== undefined && foundedYear !== "") {
      const year = Number(foundedYear);
      const currentYear = new Date().getFullYear();

      if (!Number.isInteger(year) || year < 1800 || year > currentYear) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid founded year.",
        });
      }

      company.foundedYear = year;
    }

    // Update logo if a new file was uploaded.
    if (req.file) {
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Logo must be a JPG, PNG, or WEBP image.",
        });
      }

      if (!req.file.path) {
        return res.status(400).json({
          success: false,
          message: "Uploaded logo file is unavailable.",
        });
      }

      const uploadLogo = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
        folder: "jobhub/companies",
      });

      company.logo = uploadLogo.secure_url;
    }

    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company profile updated successfully.",
      company,
    });
  } catch (error) {
    console.error("Update Company Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update company profile.",
    });
  }
};

// ==========================================
// Search Companies
// ==========================================
const searchCompanies = async (req, res) => {
  try {
    const keyword = req.query.keyword?.trim();

    if (!keyword) {
      return res.status(200).json({
        success: true,
        totalCompanies: 0,
        companies: [],
      });
    }

    // Escape regex special characters.
    const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const companies = await CompanyModel.find({
      $or: [
        { name: { $regex: safeKeyword, $options: "i" } },
        {
          companyName: {
            $regex: safeKeyword,
            $options: "i",
          },
        },
      ],
    })
      .select("name companyName logo description location industry website")
      .limit(20)
      .sort({ companyName: 1, name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      totalCompanies: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Search Companies Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search companies.",
    });
  }
};

const dashboard = async (req, res) => {
  try {
    const companyId = req.companyId;

    if (!companyId || !mongoose.isValidObjectId(companyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID.",
      });
    }

    const companyObjectId = new mongoose.Types.ObjectId(companyId);

    const [jobs, activeJob, applications] = await Promise.all([
      JobModel.countDocuments({
        company: companyObjectId,
      }),

      JobModel.countDocuments({
        company: companyObjectId,
        isActive: true,
      }),

      ApplicationsModel.countDocuments({
        company: companyObjectId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        jobs,
        activeJob,
        applications,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data.",
    });
  }
};

module.exports = {
  registerCompany,
  loginCompany,
  createCompany,
  getMyCompany,
  updateCompanyProfile,
  searchCompanies,
  dashboard,
};
