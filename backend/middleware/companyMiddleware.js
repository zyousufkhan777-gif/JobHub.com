const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const companyMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required!",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication configuration or token.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const companyId = decoded.companyId || decoded.id;

    if (!companyId || !mongoose.isValidObjectId(companyId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token: company ID is missing or invalid!",
      });
    }

    req.companyId = companyId;

    next();
  } catch (error) {
    console.error("Company Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token!",
    });
  }
};

module.exports = companyMiddleware;
