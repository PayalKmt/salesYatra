const express = require("express");
const router = express.Router();

const { verifyOtpAndGenerateToken } = require("../../../auth/delivery_agent_auth/otp_token_Create");

// POST /auth/otp-token
router.post("/otp/token", verifyOtpAndGenerateToken);
module.exports = router;
