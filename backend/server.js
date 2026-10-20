const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/Mongodb");
const cloudinaryConnect = require("./config/Cloudinary");

const userRoute = require("./routes/userRoute");
const jobRoute = require("./routes/jobRoute");
const companyRoute = require("./routes/companyRoute");
const applicationRoute = require("./routes/applicationRoute");
const resumeRoute = require("./routes/resumeRoute");
const savedjobRoute = require("./routes/savedjobRoute");
const notificationRoute = require("./routes/notificationRoute");
const adminRoute = require("./routes/adminRoute");
const authRoute = require("./routes/authRoute");

const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect MongoDB
connectDB();

// Connect Cloudinary
cloudinaryConnect();

// Routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/companies", companyRoute);
app.use("/api/applications", applicationRoute);
app.use("/api/resumes", resumeRoute);
app.use("/api/saved-jobs", savedjobRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/admin", adminRoute);

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JobHub API Working Fine!",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`JobHub Server running on port ${PORT}`);
});
