const functions = require("firebase-functions");
// const admin = require("../../config/firebase");
const dotenvResult = require("dotenv").config();
const jwt = require("jsonwebtoken");

// Check if there was any error while loading
if (dotenvResult.error) {
  throw dotenvResult.error;
}
const jwtKey = process.env.JWT_SECRET;
console.log("JWT_SECRET:", jwtKey);

exports.verifyOtpAndGenerateToken = functions.https.onRequest(
  async (req, res) => {
    try {
      const { userId, userPhoneNumber } = req.body;

      if (!userId || !userPhoneNumber) {
        return res
          .status(400)
          .json({ error: "Missing userId or userPhoneNumber" });
      }
      // 2. Generate JWT token
      const token = jwt.sign(
        { uid: userId, phone: userPhoneNumber },
        jwtKey,
        { expiresIn: "1d" } // token valid for 30 days
      );

      // 3. Send token to frontend
      res.status(200).json({ token, uid: userId });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
);
