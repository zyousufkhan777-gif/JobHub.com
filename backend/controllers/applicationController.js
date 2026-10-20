const ApplicationModel = require("../models/ApplicationModel");
const Resume = require("../models/Resume");

// Create Application
const createApplication = async (req, res) => {
  try {
    const { jobId, resumeId } = req.body;

    if (!jobId || !resumeId) {
      return res.status(400).json({
        success: false,
        message: "Please provide jobId and resumeId",
      });
    }

    // Check Resume belongs to current user
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Create Application
    const application = await ApplicationModel.create({
      user: req.userId,
      job: jobId,
      resume: resumeId,
    });

    res.status(201).json({
      success: true,
      message: "Application created successfully",
      application,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get Applications by User
const getApplicationByUser = async (req, res) => {
  try {
    const applications = await ApplicationModel.find({
      user: req.userId,
    })
      .populate({
        path: "job",
        populate: {
          path: "company",
          model: "Company",
          select: "name logo",
        },
      })
      .populate("resume")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Get applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createApplication,
  getApplicationByUser,
};
