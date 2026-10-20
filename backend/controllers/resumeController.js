const mongoose = require("mongoose");
const fs = require("fs");
const resumeModel = require("../models/Resume");
const cloudinary = require("cloudinary").v2;

// CREATE RESUME
const createResume = async (req, res) => {
  let uploadedPublicId = null;

  try {
    const userId = req.userId;
    const { title } = req.body;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!title?.trim() || !file) {
      return res.status(400).json({
        success: false,
        message: "Please provide a title and resume file.",
      });
    }

    // Validate PDF file
    if (
      file.mimetype !== "application/pdf" ||
      !file.originalname?.toLowerCase().endsWith(".pdf")
    ) {
      return res.status(400).json({
        success: false,
        message: "Only PDF files are allowed.",
      });
    }

    // Validate PDF signature
    const fileBuffer = fs.readFileSync(file.path);
    const pdfSignature = fileBuffer.subarray(0, 5).toString("ascii");

    if (pdfSignature !== "%PDF-") {
      return res.status(400).json({
        success: false,
        message: "The uploaded file is not a valid PDF.",
      });
    }

    // Only one resume per user
    const existingResume = await resumeModel.findOne({
      user: userId,
    });

    if (existingResume) {
      return res.status(409).json({
        success: false,
        message: "You already have a CV. Delete it before uploading another.",
      });
    }

    // Upload PDF to Cloudinary
    const uploadedResume = await cloudinary.uploader.upload(file.path, {
      folder: "resumes",
      resource_type: "raw",
    });

    uploadedPublicId = uploadedResume.public_id;

    // Save resume in MongoDB
    const resume = await resumeModel.create({
      user: userId,
      title: title.trim(),
      fileUrl: uploadedResume.secure_url,
      publicId: uploadedResume.public_id,
      isDefault: true,
      size: file.size,
    });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully.",
      resume,
    });
  } catch (error) {
    console.error("Create Resume Error:", error);

    // Clean up Cloudinary if database saving fails
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: "raw",
        });
      } catch (cleanupError) {
        console.error("Cloudinary cleanup error:", cleanupError.message);
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already have a CV. Delete it before uploading another.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while uploading resume.",
    });
  } finally {
    // Remove temporary file from server
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") {
          console.error("Temporary file cleanup error:", cleanupError.message);
        }
      }
    }
  }
};

// GET MY RESUMES
const getMyResumes = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const resumes = await resumeModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    console.error("Get My Resumes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching resumes.",
    });
  }
};

// DELETE RESUME
const removeResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Validate resume ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID.",
      });
    }

    // Find only the logged-in user's resume
    const resume = await resumeModel.findOne({
      _id: id,
      user: userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    // Delete PDF from Cloudinary
    if (resume.publicId) {
      await cloudinary.uploader.destroy(resume.publicId, {
        resource_type: "raw",
      });
    }

    // Delete resume from MongoDB
    await resumeModel.deleteOne({
      _id: resume._id,
      user: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully.",
    });
  } catch (error) {
    console.error("Remove Resume Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting resume.",
    });
  }
};

module.exports = {
  createResume,
  getMyResumes,
  removeResume,
};
