const { cert, getApps, initializeApp } = require("firebase-admin/app");

const serviceAccount = require("../config/firebase-service-account.json");

const firebaseAdmin =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
      })
    : getApps()[0];

module.exports = firebaseAdmin;
