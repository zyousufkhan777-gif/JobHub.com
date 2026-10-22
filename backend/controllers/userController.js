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

    if (
      typeof name !== "string" ||
      !name.trim() ||
      phone == null ||
      typeof location !== "string" ||
      !location.trim() ||
      skills == null ||
      typeof education !== "string" ||
      !education.trim() ||
      typeof experience !== "string" ||
      !experience.trim()
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

    if (req.file) {
      const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });

      imageUrl = uploadedImage.secure_url;
    }

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
    const jobs = await JobModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate({
        path: "company",
        select: "companyName logo",
      })
      .lean();

    const formattedJobs = jobs.map((job) => ({
      ...job,
      company:
        job.company && typeof job.company === "object"
          ? {
              _id: job.company._id,
              companyName:
                typeof job.company.companyName === "string"
                  ? job.company.companyName.trim()
                  : "",
              logo: job.company.logo || "",
            }
          : null,
    }));

    return res.status(200).json({
      success: true,
      count: formattedJobs.length,
      jobs: formattedJobs,
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
        message: "Invalid job ID",
      });
    }

    const job = await JobModel.findById(id).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const company = await CompanyModel.findById(job.company)
      .select("companyName logo")
      .lean();

    const formattedJob = {
      ...job,
      company: company
        ? {
            _id: company._id,
            companyName:
              typeof company.companyName === "string"
                ? company.companyName.trim()
                : "",
            logo: company.logo || "",
          }
        : null,
    };

    console.log("JOB DETAILS COMPANY:", formattedJob.company);

    return res.status(200).json({
      success: true,
      job: formattedJob,
    });
  } catch (error) {
    console.error("Job Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job details",
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

    const company = await CompanyModel.findById(id).lean();

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    const jobs = await JobModel.find({
      company: company._id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      company: {
        ...company,
        companyName:
          typeof company.companyName === "string"
            ? company.companyName.trim()
            : "",
      },
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

// GET ALL COMPANIES
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
      companyName:
        typeof company.companyName === "string"
          ? company.companyName.trim()
          : "",
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

module.exports = {
  UpdateProfile,
  getallJob,
  jobDetails,
  getallCompanies,
  companyDetails,
};
