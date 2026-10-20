const express = require("express");
const companyMiddleware = require("../middleware/companyMiddleware");

const {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getApplicationsForJob,
  updateApplicationStatus,
  searchJobs,
  filterJobs,
  searchbyname,
} = require("../controllers/jobController");

const jobRoute = express.Router();

// Search jobs (public)
jobRoute.get("/search", searchJobs);

// Filter jobs (public)
jobRoute.get("/filter", filterJobs);

// Search by others
jobRoute.get("/all-search", searchbyname);

// Create a new job
jobRoute.post("/create", companyMiddleware, createJob);

// Get all jobs of the logged-in company
jobRoute.get("/", companyMiddleware, getJobs);

// Get applications for a specific job
jobRoute.get("/:jobId/applications", companyMiddleware, getApplicationsForJob);

// Update an application for a specific job
jobRoute.post(
  "/:jobId/applications/:applicationId",
  companyMiddleware,
  updateApplicationStatus,
);

// Update a specific job
jobRoute.post("/:jobId", companyMiddleware, updateJob);

// Delete a specific job
jobRoute.delete("/:jobId", companyMiddleware, deleteJob);


module.exports = jobRoute;
