# Email Service Analysis for AlgoAliens Project

## Overview
This document provides a comprehensive analysis of the email service implementation in the AlgoAliens project, focusing on OTP (One-Time Password) verification and password reset functionality.

## Email Service Configuration

### Technology Stack
- **Nodemailer**: Primary email sending library
- **SMTP**: Standard email protocol for sending emails
- **Environment Variables**: Secure configuration via `.env` file

### Environment Variables
The email service relies on the following environment variables:

```env
# Primary email configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Alternative SMTP configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Twilio for SMS backup (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM=your_twilio_phone_number
```

## OTP (One-Time Password) Implementation

### 1. OTP Request Endpoint
**API Endpoint**: `POST /otp/request` and `POST /api/otp/request`

**Implementation Details**:
- Generates a random 6-digit OTP: `Math.floor(100000 + Math.random() * 900000)`
- Stores OTP in memory (Map) or database with expiration time
- Sends OTP via email using Nodemailer transporter
- Supports both email and SMS delivery (SMS via Twilio)

**Code Snippet from App.js**:
```javascript
// Function to send OTP email
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: {
            name: 'AlgoAliens',
            address: process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@algoaliens.com'
        },
        to: email,
        subject: 'Your AlgoAliens Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #480360; margin: 0; font-size: 28px;">AlgoAliens</h1>
                        <p style="color: #666; margin: 5px 0 0 0;">Algorithm Learning Platform</p>
                    </div>
                    
                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Verify Your Email Address</h2>
                    
                    <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Thank you for signing up with AlgoAliens! To complete your registration, please use the verification code below:</p>
                    
                    <div style="background-color: #480360; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 30px 0;">
                        ${otp}
                    </div>
                    
                    <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.</p>
                    
                    <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
                        <p style="color: #999; font-size: 12px; margin: 0;">© 2025 AlgoAliens. All rights reserved.</p>
                        <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </div>
        `,
        text: `
            AlgoAliens - Email Verification
            
            Thank you for signing up with AlgoAliens!
            
            Your verification code is: ${otp}
            
            This code will expire in 10 minutes.
            
            If you didn't request this code, please ignore this email.
            
            © 2025 AlgoAliens. All rights reserved.
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};
```

**Code Snippet from alien.routes.js**:
```javascript
// Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// In the OTP request endpoint
await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your Verification Code",
    text: `Your OTP is ${otp}. It expires in ${OTP_EXP_MINUTES} minute(s).`,
    html: `<p>Your OTP is <b>${otp}</b>. It expires in ${OTP_EXP_MINUTES} minute(s).</p>`,
});
```

### 2. OTP Storage and Expiration
- **In-Memory Storage**: Uses JavaScript Map for development
- **Database Storage**: Uses PostgreSQL table for production (in routes file)
- **Expiration Time**: 10 minutes (configurable via OTP_EXP_MINUTES environment variable)
- **Security Features**: Attempt limiting (maximum 3 attempts), automatic cleanup

### 3. OTP Verification Process
**API Endpoint**: `POST /otp/verify` and `POST /api/otp/verify`

## Password Reset Implementation

### 1. Planned Password Reset Endpoints
The project has structured endpoints for password reset but with placeholder implementations:

**Forgot Password Endpoint**: `POST /auth/forgot-password`
```javascript
app.post('/auth/forgot-password', passwordResetLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        // Check if user exists
        const userQuery = 'SELECT id, firstname, lastname FROM users WHERE email = $1';
        const user = await runFetchQuery(userQuery, [email]);
        
        if (!user) {
            // Don't reveal if email exists for security
            return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
        }
        
        // In a real app, you would generate a reset token and send email
        // For now, just return success
        res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
    } catch (err) {
        console.error('Error handling forgot password:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
```

**Reset Password Endpoint**: `POST /auth/reset-password`
```javascript
app.post('/auth/reset-password', passwordResetLimiter, async (req, res) => {
    try {
        const { token, password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }
        
        // In a real app, you would verify the reset token
        // For now, just return success
        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
```

### 2. Rate Limiting for Password Reset
- **Endpoint Protection**: Both password reset endpoints have rate limiting
- **Limit**: 5 attempts per hour per IP address
- **Purpose**: Prevent abuse and brute force attacks

## Email Transporter Configuration

### Main Transporter (App.js)
```javascript
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER, // Support both env vars
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS  // Support both env vars
    }
});
```

### Alternative Transporter (alien.routes.js)
```javascript
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
```

## Supported Email Providers

### 1. Gmail (Default)
- Host: `smtp.gmail.com`
- Port: `587`
- Security: `false` (STARTTLS)
- Requires: App password (not regular Gmail password)

### 2. Outlook/Hotmail
- Host: `smtp-mail.outlook.com`
- Port: `587`
- Security: `false` (STARTTLS)

### 3. Yahoo Mail
- Host: `smtp.mail.yahoo.com`
- Port: `587`
- Security: `false` (STARTTLS)

### 4. Custom SMTP Providers
- Configurable via environment variables
- Supports any SMTP-compliant email service

## Security Features

### 1. OTP Security
- Random 6-digit codes
- Time-based expiration (10 minutes)
- Attempt limiting (3 attempts max)
- Automatic cleanup after verification
- In-memory storage with expiration

### 2. Password Reset Security
- Does not reveal if email exists (security measure)
- Rate limiting to prevent abuse
- Token-based verification system

### 3. Environment Security
- Credentials stored in environment variables
- Support for multiple environment variable names
- No hardcoded credentials in code

## Frontend Integration

### 1. Sign-up Flow with OTP
1. User fills form → clicks "Send OTP"
2. OTP sent → user receives 6-digit code via email
3. User enters OTP → verification happens
4. Account created → user redirected to onboarding

### 2. Email Configuration Requirements
- Gmail app password setup required
- Environment variables must be properly configured
- SMTP settings need to match email provider

## Error Handling

### 1. Email Sending Failures
- Graceful fallback when email sending fails
- OTP cleanup when email service unavailable
- Clear error messages for users

### 2. OTP Validation Errors
- Invalid OTP handling
- Expired OTP detection
- Maximum attempt exceeded handling

## Testing and Development

### 1. Development Mode
- Console logging for OTP codes during development
- Email service availability checks
- Debug mode with detailed logging

### 2. Test Endpoints
```bash
# Test OTP Request
curl -X POST http://localhost:4000/otp/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test OTP Verification
curl -X POST http://localhost:4000/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

## Future Enhancements

### 1. Production Ready Features
- Redis for OTP storage instead of in-memory
- Enhanced email templates
- Delivery status tracking
- Retry mechanisms for failed emails

### 2. Additional Email Types
- Welcome emails for new users
- Password change notifications
- Account activity alerts
- Marketing and promotional emails

## Conclusion

The AlgoAliens project has a robust foundation for email services, primarily focused on OTP verification for user registration. The implementation includes proper security measures, error handling, and a framework for password reset functionality. While the password reset is currently in a placeholder state, the infrastructure is in place to implement it with email verification tokens.