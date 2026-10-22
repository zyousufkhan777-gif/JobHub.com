const CompanyModel = require("../models/CompanyModel");
const JobModel = require("../models/JobModel");
const UserModel = require("../models/UserModel");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

// UPDATE USER PROFILE
const UpdateProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      name,
      professionalTitle,
      phone,
      location,
      skills,
      education,
      experience,
    } = req.body;

    const imageUpload = req.file;

    // Validate required fields
    if (
      !name?.trim() ||
      phone == null ||
      !location?.trim() ||
      skills == null ||
      !education?.trim() ||
      !experience?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing Details",
      });
    }

    if (
      professionalTitle != null &&
      (typeof professionalTitle !== "string" || professionalTitle.length > 100)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Professional title must be a string with at most 100 characters",
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    let imageUrl = user.profilePhoto;

    if (imageUpload) {
      const uploadImage = await cloudinary.uploader.upload(imageUpload.path, {
        resource_type: "image",
      });

      imageUrl = uploadImage.secure_url;
    }

    // Update user information
    user.name = name.trim();

    if (professionalTitle !== undefined) {
      user.professionalTitle = professionalTitle.trim();
    }

    user.phone = phone;
    user.location = location.trim();
    user.skills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
        ? skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : skills;

    user.education = education.trim();
    user.experience = experience.trim();
    user.profilePhoto = imageUrl;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user: {
        id: user._id,
        name: user.name,
        professionalTitle: user.professionalTitle,
        email: user.email,
        phone: user.phone,
        location: user.location,
        skills: user.skills,
        education: user.education,
        experience: user.experience,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// GET ALL ACTIVE JOBS
const getallJob = async (req, res) => {
  try {
    const jobs = await JobModel.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("company", "logo companyName");

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get All Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs.",
    });
  }
};

// GET JOB DETAILS
const jobDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID.",
      });
    }

    const job = await JobModel.findOne({
      _id: id,
      isActive: true,
    }).populate("company", "name logo");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
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
      message: "Failed to fetch job details.",
    });
  }
};

// GET ALL ACTIVE COMPANIES
const getallCompanies = async (req, res) => {
  try {
    const companies = await CompanyModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    const jobCounts = await JobModel.aggregate([
      {
        $match: {
          isActive: true,
          company: {
            $in: companies.map((company) => company._id),
          },
        },
      },
      {
        $group: {
          _id: "$company",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(
      jobCounts.map((item) => [item._id.toString(), item.count]),
    );

    const companiesWithJobCount = companies.map((company) => ({
      ...company,
      jobCount: countMap.get(company._id.toString()) || 0,
    }));

    return res.status(200).json({
      success: true,
      count: companiesWithJobCount.length,
      companies: companiesWithJobCount,
    });
  } catch (error) {
    console.error("Get All Companies Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies.",
    });
  }
};

// GET COMPANY DETAILS
const companyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID.",
      });
    }

    // Search without isActive filter for debugging
    const company = await CompanyModel.findById(id).lean();

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found in Company collection.",
      });
    }

    const jobs = await JobModel.find({
      company: company._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      company,
      jobs,
      jobCount: jobs.length,
    });
  } catch (error) {
    console.error("Company Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company details.",
    });
  }
};

module.exports = {
  UpdateProfile,
  getallJob,
  jobDetails,
  getallCompanies,
  companyDetails,
};
