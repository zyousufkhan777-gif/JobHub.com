const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "review", "shortlisted", "rejected", "accepted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
