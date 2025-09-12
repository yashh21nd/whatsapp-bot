import express from 'express';
import User from '../models/user.js';
import nodemailer from 'nodemailer';
// Configure nodemailer transporter (use your SMTP credentials)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your@email.com',
    pass: process.env.SMTP_PASS || 'yourpassword'
  }
});

async function sendOtpEmail(email, otp) {
  await transporter.sendMail({
    from: 'WhatsApp Bot <no-reply@whatsapp-bot.com>',
    to: email,
    subject: 'Your WhatsApp Bot OTP',
    text: `Your OTP is: ${otp}`,
    html: `<p>Your OTP is: <b>${otp}</b></p>`
  });
}

const router = express.Router();

// POST /api/auth/signup - Register user and send OTP

// Utility to generate OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/signup - Register user and send OTP

router.post('/signup', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  let user = await User.findOne({ email });
  if (user) {
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
  } else {
    user = await User.create({ email, otp, otpExpires });
  }
  try {
    await sendOtpEmail(email, otp);
    res.json({ success: true, message: 'OTP sent to email.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP email.' });
  }
});

// POST /api/auth/login - Send OTP for login

// POST /api/auth/login - Send OTP for login

router.post('/login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const otp = generateOtp();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  try {
    await sendOtpEmail(email, otp);
    res.json({ success: true, message: 'OTP sent to email.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP email.' });
  }
});

// POST /api/auth/verify - Verify OTP

// POST /api/auth/verify - Verify OTP
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.otp !== otp || user.otpExpires < new Date()) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }
  user.otp = null;
  user.otpExpires = null;
  user.lastLogin = new Date();
  await user.save();
  // TODO: Set session/cookie if needed
  res.json({ success: true, message: 'OTP verified. Login successful.' });
});

export default router;
