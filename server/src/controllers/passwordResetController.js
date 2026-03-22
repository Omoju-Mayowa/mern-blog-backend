import { HttpError } from "../models/errorModel.js";
import generateOTP from "../utils/generateOTP.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/userModel.js";
import crypto from "crypto";
import sendCookie from "../utils/sendCookie.js";
import { getPeppers, getCurrentPepper } from "../utils/peppers.js";
import { resetConfirmTemplate, otpEmailTemplate } from "../utils/emailTemplates.js";

// Consistent with your User Controller
const argonOptionsStrong = {
  type: argon2.argon2id,
  memoryCost: 2 ** 17,
  timeCost: 6,
  parallelism: 4,
};

// Password Prehash Helper
function prehashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Returns the hash AND the version index to ensure
 * the database stays in sync with the pepper used.
 */
async function hashWithCurrentPepper(prehashedPassword) {
  const current = getCurrentPepper();
  const peppers = getPeppers();
  const hash = await argon2.hash(
    (current || "") + prehashedPassword,
    argonOptionsStrong,
  );
  const version = peppers.indexOf(current);

  return {
    hash,
    version: version !== -1 ? version : 0,
  };
}

// ---------------- SEND RESET OTP ----------------
const sendResetOTP = async (req, res, next) => {
  console.log('sendResetOTP hit', req.body)
  try {
    const { email } = req.body;
    if (!email) return next(new HttpError("Email is required", 400));

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return next(new HttpError("No account found with that email", 404));

    const otp = generateOTP();
    const otpExpiry = 15 * 60 * 1000;
    const minutes = otpExpiry / 60000;
    const otpExpiresAt = Date.now() + otpExpiry;

    // Push new OTP to the array
    user.otp.push({
      code: otp,
      expiresAt: otpExpiresAt,
      verified: false,
      createdAt: new Date(),
    });

    await user.save();
    
    await sendEmail(
      user.email,
      "Password Reset OTP",
      otpEmailTemplate(otp, minutes)
    )
    
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
};

// ---------------- RESET PASSWORD ----------------
// ---------------- VERIFY OTP ----------------
const verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) return next(new HttpError("OTP is required", 400));

    const user = await User.findOne({ "otp.code": otp });
    if (!user || !user.otp || user.otp.length === 0)
      return next(new HttpError("Invalid OTP", 400));

    const otpEntry = user.otp.find((o) => o.code.toString() === otp.toString());
    if (!otpEntry) return next(new HttpError("Invalid OTP", 400));

    if (Date.now() > otpEntry.expiresAt)
      return next(new HttpError("OTP expired. Request a new one.", 400));

    // Mark OTP as verified but don't clear yet — needed for reset step
    otpEntry.verified = true;
    await user.save();

    return res.status(200).json({ message: "OTP verified", email: user.email });
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
};

// ---------------- RESET PASSWORD ----------------
const resetPassword = async (req, res, next) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;
    if (!otp || !newPassword || !confirmPassword)
      return next(new HttpError("All fields are required", 400));

    if (newPassword !== confirmPassword)
      return next(new HttpError("Passwords do not match", 400));

    const user = await User.findOne({ "otp.code": otp });
    if (!user || !user.otp || user.otp.length === 0)
      return next(new HttpError("Invalid request or OTP", 400));

    const otpEntry = user.otp.find((o) => o.code.toString() === otp.toString());
    if (!otpEntry) return next(new HttpError("Invalid OTP", 400));

    // Must be verified first
    if (!otpEntry.verified)
      return next(new HttpError("OTP not verified", 400));

    // Check expiry again
    if (Date.now() > otpEntry.expiresAt)
      return next(new HttpError("OTP expired. Request a new one.", 400));

    const prehashedNewPassword = prehashPassword(newPassword);
    const { hash, version } = await hashWithCurrentPepper(prehashedNewPassword);

    user.password = hash;
    user.pepperVersion = version;
    user.otp = [];
    await user.save();

    await sendEmail(
      user.email,
      "Password Reset Confirmation",
      resetConfirmTemplate(user.name)
    );

    sendCookie(res, 200, { id: user._id, name: user.name, avatar: user.avatar })

  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
};

export { sendResetOTP, verifyOTP, resetPassword };
