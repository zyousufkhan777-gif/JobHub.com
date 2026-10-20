const JobModel = require("../models/JobModel");
const ApplicationModel = require("../models/ApplicationModel");

const { createNotification } = require("../services/notificationService");

const createJob = async (req, res) => {
  try {
    const companyId = req.companyId;

    const {
      title,
      description,
      category,
      location,
      jobType,
      workMode,
      salary,
      skills,
      experience,
      deadline,
    } = req.body || {};

    // Check authentication
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required!",
      });
    }

    // Required fields
    if (!title || !description || !category || !jobType) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category and job type are required!",
      });
    }

    // Create Job
    const job = await JobModel.create({
      title,
      description,
      company: companyId,
      category,
      location,
      jobType,
      workMode,
      salary,
      skills,
      experience,
      deadline,
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully!",
      job,
    });
  } catch (error) {
    console.log("Create Job Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get all jobs
const getJobs = async (req, res) => {
  try {
    const companyId = req.companyId;

    // Check authentication
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required!",
      });
    }

    // Get all jobs created by this company
    const jobs = await JobModel.find({
      company: companyId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.log("Get Company Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// U[date job
const updateJob = async (req, res) => {
  try {
    const companyId = req.companyId;
    const { jobId } = req.params;

    const {
      title,
      description,
      category,
      location,
      jobType,
      workMode,
      salary,
      skills,
      experience,
      deadline,
      isActive,
    } = req.body || {};

    // Check authentication
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required!",
      });
    }

    // Find job belonging to this company
    const job = await JobModel.findOne({
      _id: jobId,
      company: companyId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you don't have permission!",
      });
    }

    // Update only fields that were sent
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (category !== undefined) job.category = category;
    if (location !== undefined) job.location = location;
    if (jobType !== undefined) job.jobType = jobType;
    if (workMode !== undefined) job.workMode = workMode;
    if (salary !== undefined) job.salary = salary;
    if (skills !== undefined) job.skills = skills;
    if (experience !== undefined) job.experience = experience;
    if (deadline !== undefined) job.deadline = deadline;
    if (isActive !== undefined) job.isActive = isActive;

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job updated successfully!",
      job,
    });
  } catch (error) {
    console.log("Update Job Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Dlelete Job API
const deleteJob = async (req, res) => {
  try {
    const companyId = req.companyId;
    const { jobId } = req.params;

    // Check authentication
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required!",
      });
    }

    // Find job belonging to this company
    const job = await JobModel.findOne({
      _id: jobId,
      company: companyId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you don't have permission!",
      });
    }

    // Delete job
    await JobModel.findByIdAndDelete(jobId);

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully!",
    });
  } catch (error) {
    console.log("Delete Job Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get applications for a specific job
const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Find the job
    const job = await JobModel.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if this company owns the job
    if (job.company.toString() !== req.companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these applications",
      });
    }

    // Get applications
    const applications = await ApplicationModel.find({
      job: jobId,
    })
      .populate("user")
      .populate("resume")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get Job Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update status of a specific application
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body || {};

    const companyId = req.companyId;

    // Check authentication
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required!",
      });
    }

    const allowedStatus = [
      "pending",
      "under_review",
      "shortlisted",
      "rejected",
    ];

    // Check status
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    // Find application
    const application = await ApplicationModel.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Find job
    const job = await JobModel.findById(application.job);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if this company owns the job
    if (job.company.toString() !== companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this application",
      });
    }

    // Update application status
    application.status = status;

    await application.save();

    // Create notification for the applicant
    await createNotification({
      user: application.user,
      title: "Application Status Updated",
      message: `Your application status has been changed to ${status}.`,
      type: "application",
    });

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// job Search API //
const searchJobs = async (req, res) => {
  try {
    const { keyword, location } = req.query;

    const filter = {
      isActive: true,
    };

    // Search by title, description, skills, or category
    if (keyword && keyword.trim()) {
      const safeKeyword = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(safeKeyword, "i");

      filter.$or = [
        { title: regex },
        { description: regex },
        { skills: regex },
        { category: regex },
      ];
    }

    // Filter by location
    if (location && location.trim()) {
      const safeLocation = location
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.location = new RegExp(safeLocation, "i");
    }

    const jobs = await JobModel.find(filter)
      .populate("company", "name logo")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Search Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search jobs",
    });
  }
};
//=============================================//
// ================filter======================//
//==============================================//

const filterJobs = async (req, res) => {
  try {
    const { jobType, experience, salaryRange, location } = req.query;

    const filter = {
      isActive: true,
    };

    // 1. Job Type
    if (jobType) {
      const allowedJobTypes = [
        "Full-time",
        "Part-time",
        "Internship",
        "Contract",
        "Freelance",
      ];

      if (!allowedJobTypes.includes(jobType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid job type",
        });
      }

      filter.jobType = jobType;
    }

    // 2. Experience Level
    if (experience) {
      const allowedExperience = ["Entry Level", "Mid Level", "Senior Level"];

      if (!allowedExperience.includes(experience)) {
        return res.status(400).json({
          success: false,
          message: "Invalid experience level",
        });
      }

      filter.experience = experience;
    }

    // 3. Salary Range
    const salaryRanges = {
      "0-50K": { min: 0, max: 50000 },
      "50K-100K": { min: 50000, max: 100000 },
      "100K-150K": { min: 100000, max: 150000 },
      "150K+": { min: 150000, max: Infinity },
    };

    if (salaryRange) {
      const range = salaryRanges[salaryRange];

      if (!range) {
        return res.status(400).json({
          success: false,
          message: "Invalid salary range",
        });
      }

      filter.salaryMin = { $lte: range.max };

      if (Number.isFinite(range.max)) {
        filter.salaryMax = { $gte: range.min };
      } else {
        filter.salaryMax = { $gte: range.min };
      }
    }

    // 4. Location
    if (location) {
      if (location === "Remote") {
        filter.workMode = "Remote";
      } else {
        const safeLocation = location
          .trim()
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        filter.location = new RegExp(safeLocation, "i");
      }
    }

    const jobs = await JobModel.find(filter)
      .populate("company", "name logo")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Filter Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to filter jobs",
    });
  }
};

// jobSearch //

const searchbyname = async (req, res) => {
  try {
    const { keyword } = req.query;

    const filter = {
      isActive: true,
    };

    if (keyword && keyword.trim()) {
      const safeKeyword = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(safeKeyword, "i");

      filter.$or = [
        { title: regex },
        { description: regex },
        { skills: regex },
        { category: regex },
      ];
    }

    const jobs = await JobModel.find(filter)
      .populate("company", "name logo")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Search Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search jobs",
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getApplicationsForJob,
  updateApplicationStatus,
  searchJobs,
  filterJobs,
  searchbyname,
};
