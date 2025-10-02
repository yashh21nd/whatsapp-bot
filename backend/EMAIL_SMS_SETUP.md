# 📧 Email & SMS Configuration Guide

This guide will help you set up email and SMS delivery for OTP verification in your WhatsApp Bot.

## 🔧 Quick Setup for Testing

For testing purposes, you can use the development mode which simulates sending OTPs without requiring real credentials:

1. Make sure `DEV_MODE=true` is set in your `.env` file (it's already set by default)
2. When testing, OTPs will be logged to the console instead of being sent via email/SMS

## 📧 Email Configuration (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Security → 2-Step Verification → Turn on

### Step 2: Generate App Password
1. Go to Google Account → Security → 2-Step Verification
2. Scroll down to "App passwords"
3. Select "Other (Custom name)" → Enter "WhatsApp Bot"
4. Copy the 16-character password

### Step 3: Update .env file
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # Your app password (no spaces)
SMTP_FROM=WhatsApp Bot <your_email@gmail.com>
```

## 📱 SMS Configuration (Twilio)

### Step 1: Create Twilio Account
1. Go to [twilio.com](https://www.twilio.com)
2. Sign up for a free account
3. Verify your phone number

### Step 2: Get Credentials
1. From Twilio Console Dashboard:
   - Account SID
   - Auth Token
2. Get a phone number:
   - Go to Phone Numbers → Manage → Buy a number
   - Choose a number that supports SMS

### Step 3: Update .env file
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## 🧪 Testing Configuration

### Test Email OTP
```bash
curl -X POST http://localhost:8081/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"type":"email","contact":"your_email@gmail.com"}'
```

### Test SMS OTP
```bash
curl -X POST http://localhost:8081/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"type":"phone","contact":"+1234567890"}'
```

## 🚀 Production Deployment

For production on Render:
1. Add all environment variables in Render Dashboard
2. Set `DEV_MODE=false`
3. Restart your service

## 🔍 Troubleshooting

### Email Issues
- Check if 2FA is enabled on Google account
- Verify app password is correct (no spaces)
- Check if "Less secure app access" is enabled (if not using app password)

### SMS Issues
- Verify phone number format includes country code
- Check Twilio account balance
- Ensure phone number supports SMS

### Development Mode
- If credentials aren't configured, OTPs will be logged to console
- Look for console output like: `DEV MODE: OTP for user@email.com is 123456`

## 📋 Environment Variables Summary

Required for production:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

Optional:
- `DEV_MODE=true` (for testing without real credentials)
- `OTP_EXPIRY_MINUTES=5` (OTP validity time)
- `OTP_LENGTH=6` (OTP code length)