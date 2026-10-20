const JobModel = require("../models/JobModel");
const SavedJobModel = require("../models/SavedJobModel");

const savedJob = async (req, res) => {
  try {
    const userId = req.userId;
    const { jobId } = req.body || {};

    // Check authentication and jobId
    if (!userId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "UserId and JobId are required",
      });
    }

    // Check if job exists
    const job = await JobModel.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if job is already saved
    const existingSavedJob = await SavedJobModel.findOne({
      user: userId,
      job: jobId,
    });

    if (existingSavedJob) {
      return res.status(400).json({
        success: false,
        message: "Job already saved",
      });
    }

    // Create saved job
    const newSavedJob = new SavedJobModel({
      user: userId,
      job: jobId,
    });

    // IMPORTANT: Save to MongoDB
    await newSavedJob.save();

    return res.status(201).json({
      success: true,
      message: "Job saved successfully",
      data: newSavedJob,
    });
  } catch (error) {
    console.log("Save Job Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get all Saved Jobs
const getSavedJobs = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const savedJobs = await SavedJobModel.find({
      user: userId,
    })
      .populate("job")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: savedJobs.length,
      data: savedJobs,
    });
  } catch (error) {
    console.error("Get Saved Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const checkSavedJob = async (req, res) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;

    // Check authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check jobId
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    // Check if saved
    const savedJob = await SavedJobModel.findOne({
      user: userId,
      job: jobId,
    });

    return res.status(200).json({
      success: true,
      isSaved: !!savedJob,
    });
  } catch (error) {
    console.error("Check Saved Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const removeSavedJob = async (req, res) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;

    // Check authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check jobId
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    // Remove saved job
    const deletedSavedJob = await SavedJobModel.findOneAndDelete({
      user: userId,
      job: jobId,
    });

    if (!deletedSavedJob) {
      return res.status(404).json({
        success: false,
        message: "Saved job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Saved job removed successfully",
    });
  } catch (error) {
    console.error("Remove Saved Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  savedJob,
  getSavedJobs,
  checkSavedJob,
  removeSavedJob,
};
