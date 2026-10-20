const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  savedJob,
  getSavedJobs,
  removeSavedJob,
  checkSavedJob,
} = require("../controllers/savedjobController");

const savedjobRoute = express.Router();

// Save Job
savedjobRoute.post("/add-saved-job", authMiddleware, savedJob);

// Get Saved Jobs
savedjobRoute.get("/get-saved-jobs", authMiddleware, getSavedJobs);

// Check if Job is Saved
savedjobRoute.get("/:jobId/check", authMiddleware, checkSavedJob);

// Remove Saved Job
savedjobRoute.delete(
  "/remove-saved-job/:jobId",
  authMiddleware,
  removeSavedJob,
);

module.exports = savedjobRoute;
