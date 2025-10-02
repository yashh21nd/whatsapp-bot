# Environment Configuration for WhatsApp Bot

## Backend Environment Variables (.env file in backend/)

Create a `.env` file in the `backend/` directory with the following variables:

### Database
```
MONGODB_URI=your_mongodb_connection_string
```

### Email OTP Configuration (using Gmail SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=WhatsApp Bot <your-email@gmail.com>
```

### SMS OTP Configuration (Twilio)
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Other Configuration
```
PORT=3001
NODE_ENV=production
```

## Frontend Environment Variables (.env file in frontend/)

Create a `.env` file in the `frontend/` directory:

```
VITE_API_URL=https://your-backend-url.render.com
```

For local development:
```
VITE_API_URL=http://localhost:3001
```

## Setting up Email (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in SMTP_PASS

## Setting up SMS (Twilio)

1. Sign up at https://twilio.com
2. Get your Account SID and Auth Token from Console
3. Purchase a phone number or use trial number
4. Add phone number to TWILIO_PHONE_NUMBER

## Test Mode

If Twilio credentials are not configured, the system will:
- Log OTP to console instead of sending SMS
- Still send email OTPs if SMTP is configured
- Return testMode: true in API responses

## Security Notes

- Never commit .env files to version control
- Use strong, unique passwords
- Regularly rotate API keys and tokens
- Consider using environment-specific configurations