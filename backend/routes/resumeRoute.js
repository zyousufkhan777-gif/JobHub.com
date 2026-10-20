const express = require("express");

const upload = require("../middleware/multer");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createResume,
  getMyResumes,
  removeResume,
} = require("../controllers/resumeController");

const resumeRoute = express.Router();

// Upload one PDF CV
resumeRoute.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  createResume,
);

// Get the authenticated user's CV
resumeRoute.get("/my-resumes", authMiddleware, getMyResumes);

// Delete a CV by ID
resumeRoute.delete("/delete", authMiddleware, removeResume);

module.exports = resumeRoute;
