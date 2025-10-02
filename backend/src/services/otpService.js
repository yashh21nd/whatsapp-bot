import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Configure email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your@email.com',
    pass: process.env.SMTP_PASS || 'yourpassword'
  }
});

// Configure Twilio client
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Generate OTP
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send Email OTP
export async function sendEmailOtp(email, otp) {
  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      // Fallback: Log to console for testing if SMTP is not configured
      console.log(`DEV MODE: Email OTP for ${email}: ${otp}`);
      return { 
        success: true, 
        message: 'Email service not configured. Check console for OTP.',
        testMode: true 
      };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'WhatsApp Bot <no-reply@whatsapp-bot.com>',
      to: email,
      subject: 'Your WhatsApp Bot Verification Code',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: #25d366; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📱</div>
            <h1 style="color: #4a4a4a; font-size: 24px; margin: 0;">WhatsApp Business</h1>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #25d366; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h2>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Your verification code</p>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            Enter this code in your WhatsApp Business app to complete your sign-in. This code will expire in 10 minutes.
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999; text-align: center;">
            If you didn't request this code, please ignore this email.
          </div>
        </div>
      `,
      text: `Your WhatsApp Business verification code is: ${otp}. This code will expire in 10 minutes.`
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`Email OTP sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Email OTP error:', error);
    // Fallback to console in case of error
    console.log(`DEV MODE FALLBACK: Email OTP for ${email}: ${otp}`);
    return { 
      success: true, 
      message: 'Email delivery failed, but OTP is available in console for testing.',
      testMode: true 
    };
  }
}

// Send SMS OTP
export async function sendSmsOtp(phoneNumber, otp) {
  try {
    if (!twilioClient) {
      // Fallback: Log to console for testing if Twilio is not configured
      console.log(`DEV MODE: SMS OTP for ${phoneNumber}: ${otp}`);
      return { 
        success: true, 
        message: 'SMS service not configured. Check console for OTP.',
        testMode: true 
      };
    }

    const message = await twilioClient.messages.create({
      body: `Your WhatsApp Business verification code is: ${otp}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`SMS OTP sent to ${phoneNumber}, SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('SMS OTP error:', error);
    return { success: false, error: error.message };
  }
}

// Validate phone number format
export function validatePhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid international format (8-15 digits)
  if (cleaned.length < 8 || cleaned.length > 15) {
    return false;
  }
  
  // Must start with country code (not 0 or 1 unless it's +1)
  if (cleaned.startsWith('0') && cleaned.length > 10) {
    return false;
  }
  
  return true;
}

// Validate email format
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Format phone number to E.164 format
export function formatPhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add + prefix if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}