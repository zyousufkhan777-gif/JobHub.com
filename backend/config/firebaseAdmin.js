const { cert, getApps, initializeApp } = require("firebase-admin/app");
const path = require("path");

const serviceAccountPath = path.join(
  __dirname,
  "firebase-service-account.json",
);

const serviceAccount = require(serviceAccountPath);

const firebaseAdmin =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
      })
    : getApps()[0];

module.exports = firebaseAdmin;
