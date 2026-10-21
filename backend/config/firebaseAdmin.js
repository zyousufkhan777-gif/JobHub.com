const { cert, getApps, initializeApp } = require("firebase-admin/app");

const fs = require("fs");
const path = require("path");

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("FIREBASE_SERVICE_ACCOUNT contains invalid JSON.");
  }
} else {
  const serviceAccountPath = path.join(
    __dirname,
    "firebase-service-account.json",
  );

  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
  }
}

let firebaseAdmin = null;

if (serviceAccount) {
  firebaseAdmin =
    getApps().length === 0
      ? initializeApp({
          credential: cert(serviceAccount),
        })
      : getApps()[0];

  console.log("Firebase Admin initialized successfully.");
} else {
  console.warn("Firebase Admin not configured. Google login is unavailable.");
}

module.exports = firebaseAdmin;
