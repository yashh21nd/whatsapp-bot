import express from 'express';
import User from '../models/user.js';
import { 
  generateOtp, 
  sendEmailOtp, 
  sendSmsOtp, 
  validateEmail, 
  validatePhoneNumber, 
  formatPhoneNumber 
} from '../services/otpService.js';

const router = express.Router();

// POST /api/auth/send-otp - Send OTP to email or phone
router.post('/send-otp', sendOtpHandler);

// POST /api/auth/verify-otp - Verify OTP and complete login/signup
router.post('/verify-otp', verifyOtpHandler);

// Legacy routes for backward compatibility
router.post('/signup', async (req, res) => {
  // Redirect to new send-otp endpoint for email
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  
  // Forward to send-otp endpoint
  req.body = { type: 'email', contact: email };
  return sendOtpHandler(req, res);
});

router.post('/login', async (req, res) => {
  // Redirect to new send-otp endpoint for email
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  
  // Forward to send-otp endpoint
  req.body = { type: 'email', contact: email };
  return sendOtpHandler(req, res);
});

router.post('/verify', async (req, res) => {
  // Redirect to new verify-otp endpoint for email
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP required' });
  }
  
  // Forward to verify-otp endpoint
  req.body = { type: 'email', contact: email, otp };
  return verifyOtpHandler(req, res);
});

// Helper functions to avoid code duplication
async function sendOtpHandler(req, res) {
  try {
    // Add CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    const { type, contact } = req.body;

    if (!type || !contact) {
      return res.status(400).json({ 
        success: false, 
        error: 'Type (email/phone) and contact are required' 
      });
    }

    if (type !== 'email' && type !== 'phone') {
      return res.status(400).json({ 
        success: false, 
        error: 'Type must be either "email" or "phone"' 
      });
    }

    // Validate contact format
    if (type === 'email' && !validateEmail(contact)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    if (type === 'phone' && !validatePhoneNumber(contact)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid phone number format' 
      });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const userQuery = type === 'email' ? { email: contact } : { phone: formatPhoneNumber(contact) };
    let user = await User.findOne(userQuery);
    
    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      user.otpType = type;
      await user.save();
    } else {
      const userData = {
        otp,
        otpExpires,
        otpType: type,
        isVerified: false
      };
      
      if (type === 'email') {
        userData.email = contact;
      } else {
        userData.phone = formatPhoneNumber(contact);
      }
      
      user = await User.create(userData);
    }

    // Send OTP
    let result;
    if (type === 'email') {
      result = await sendEmailOtp(contact, otp);
    } else {
      const formattedPhone = formatPhoneNumber(contact);
      result = await sendSmsOtp(formattedPhone, otp);
    }

    if (result.success) {
      res.json({
        success: true,
        message: `OTP sent to your ${type}`,
        testMode: result.testMode || false
      });
    } else {
      res.status(500).json({
        success: false,
        error: `Failed to send OTP: ${result.error}`
      });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function verifyOtpHandler(req, res) {
  try {
    // Add CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    const { type, contact, otp } = req.body;

    if (!type || !contact || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Type, contact, and OTP are required'
      });
    }

    // Find user
    const userQuery = type === 'email' ? { email: contact } : { phone: formatPhoneNumber(contact) };
    const user = await User.findOne(userQuery);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found. Please request a new OTP.'
      });
    }

    // Check if OTP is valid and not expired
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify user
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    user.otpType = null;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

export default router;
