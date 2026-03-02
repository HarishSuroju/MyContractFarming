const { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { sendPhoneOTP } = require('../utils/sendSMS');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Please verify your email first'
      });
    }

    // Now update real data
    const salt = await bcrypt.genSalt(10);
    user.name = name;
    user.phone = phone;
    user.password = await bcrypt.hash(password, salt);
    user.role = role;

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Registration failed'
    });
  }
};



const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        status: 'error',
        message: 'Please verify your email before logging in'
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileComplete: user.profileComplete,
          preferredLanguage: user.preferredLanguage
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during login'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching profile'
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ status: 'error', message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    if (!email) {
      return res.status(401).json({ status: 'error', message: 'Invalid Google token' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No account found for this Google email. Please sign up first.'
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Google login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileComplete: user.profileComplete
        }
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(401).json({ status: 'error', message: 'Google authentication failed' });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    const { profileImage } = req.body;
    
    // Validate that profileImage exists and is a string
    if (profileImage && typeof profileImage !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Profile image must be a string'
      });
    }
    
    // Validate that the image doesn't exceed reasonable size (5MB for base64)
    if (profileImage && profileImage.length > 5242880) { // 5MB in bytes
      return res.status(400).json({
        status: 'error',
        message: 'Profile image is too large. Maximum size is 5MB.'
      });
    }
    
    // Find the user
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Update the profile photo - it can be a string (image data) or null
    // If no profileImage is provided, set it to null (default behavior due to schema)
    user.profilePhoto = profileImage || null;
    
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Profile photo updated successfully',
      data: { profilePhoto: user.profilePhoto }
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating profile image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return res.status(200).json({
        status: 'success',
        message: 'If an account exists with this email, a password reset link has been sent'
      });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Send reset email with the link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    const emailResult = await sendEmail({
      to: email,
      subject: 'Password Reset Request - ACF Platform',
      text: `
        ACF Platform - Password Reset
        
        You requested a password reset. Click the link below to reset your password:
        
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        
        © 2025 ACF Platform. All rights reserved.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">ACF Platform</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Assured Contract Farming</p>
            </div>
            
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">You requested a password reset. Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">This link will expire in <strong>1 hour</strong>.</p>
            
            <p style="color: #777; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">© 2025 ACF Platform. All rights reserved.</p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `
    });

    if (emailResult.success) {
      res.status(200).json({
        status: 'success',
        message: 'Password reset link sent to your email'
      });
    } else {
      // If email sending fails, we still return success to prevent email enumeration attacks
      // but log the issue for monitoring
      console.warn(`Failed to send password reset email to ${email}:`, emailResult.error);
      res.status(200).json({
        status: 'success',
        message: 'Password reset request received but failed to send email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during password reset request'
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Password reset token is invalid or has expired'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during password reset'
    });
  }
};

const sendOTP = async (req, res) => {
  try {
    console.log('sendOTP request received:', req.body);
    const { email, phone, role } = req.body;

    // Validate role
    if (!role || (role !== 'farmer' && role !== 'contractor')) {
      console.log('Invalid role provided:', role);
      return res.status(400).json({
        status: 'error',
        message: 'Valid role (farmer or contractor) is required'
      });
    }

    if (role === 'farmer') {
      // For farmers, validate phone number instead of email
      if (!phone || typeof phone !== 'string' || phone.length < 10) {
        console.log('Invalid phone provided for farmer:', phone);
        return res.status(400).json({
          status: 'error',
          message: 'Valid phone number is required for farmers'
        });
      }

      // Check if phone already exists (only reject if verified)
      const existingUser = await User.findOne({ phone });
      if (existingUser && existingUser.isVerified) {
        console.log('Phone already registered:', phone);
        return res.status(400).json({
          status: 'error',
          message: 'Phone number already registered'
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      if (existingUser && !existingUser.isVerified) {
        // If user exists but not verified, update the existing temp user
        existingUser.phoneOTP = otp;
        existingUser.phoneOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        existingUser.role = role;
        await existingUser.save();
      } else {
        // Save OTP temporarily in DB (without full account)
        const tempUser = new User({
          name: "temp",
          email: "temp@example.com", // Placeholder email for farmers
          phone,
          password: "temp",
          role,
          phoneOTP: otp,
          phoneOTPExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
          isVerified: false
        });

        await tempUser.save();
      }

      // For farmers, send OTP via SMS
      const smsResult = await sendPhoneOTP(phone, otp, role);
      
      if (smsResult.success) {
        res.status(200).json({
          status: 'success',
          message: 'OTP sent to phone'
        });
      } else {
        // If SMS sending fails, we still return success to prevent enumeration attacks
        // but log the issue for monitoring
        console.warn(`Failed to send OTP SMS to farmer ${phone}:`, smsResult.error);
        res.status(200).json({
          status: 'success',
          message: 'OTP generated but failed to send SMS. Please try again later.'
        });
      }
    } else {
      // For contractors, validate email
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        console.log('Invalid email provided for contractor:', email);
        return res.status(400).json({
          status: 'error',
          message: 'Valid email is required for contractors'
        });
      }

      // Check if email already exists (only reject if verified)
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.isVerified) {
        console.log('Email already registered:', email);
        return res.status(400).json({
          status: 'error',
          message: 'Email already registered'
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      if (existingUser && !existingUser.isVerified) {
        // If user exists but not verified, update the existing temp user
        existingUser.emailOTP = otp;
        existingUser.emailOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        existingUser.role = role;
        await existingUser.save();
      } else {
        // Save OTP temporarily in DB (without full account)
        const tempUser = new User({
          name: "temp",
          email,
          phone: "0000000000",
          password: "temp",
          role,
          emailOTP: otp,
          emailOTPExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
          isVerified: false
        });

        await tempUser.save();
      }

      // For contractors, send OTP via email
      const emailResult = await sendEmail({
        to: email,
        subject: "Your ACF Platform Verification Code",
        text: `
          ACF Platform - Email Verification
          
          Thank you for signing up with ACF Platform!
          
          Your verification code is: ${otp}
          
          This code will expire in 10 minutes.
          
          If you didn't request this code, please ignore this email.
          
          © 2025 ACF Platform. All rights reserved.
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0; font-size: 28px;">ACF Platform</h1>
                <p style="color: #666; margin: 5px 0 0 0;">Assured Contract Farming</p>
              </div>
              
              <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Verify Your Email Address</h2>
              
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Thank you for signing up with ACF Platform! To complete your registration, please use the verification code below:</p>
              
              <div style="background-color: #2563eb; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 30px 0;">
                ${otp}
              </div>
              
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.</p>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0;">© 2025 ACF Platform. All rights reserved.</p>
                <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </div>
        `
      });

      if (emailResult.success) {
        res.status(200).json({
          status: 'success',
          message: 'OTP sent to email'
        });
      } else {
        // If email sending fails, we still return success to prevent email enumeration attacks
        // but log the issue for monitoring
        console.warn(`Failed to send OTP email to ${email}:`, emailResult.error);
        res.status(200).json({
          status: 'success',
          message: 'OTP generated but failed to send email. Please try again later.'
        });
      }
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send OTP'
    });
  }
};


const verifyOTP = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    // Check if it's a farmer (using phone) or contractor (using email)
    let user;
    if (phone) {
      // For farmers, verify phone OTP
      user = await User.findOne({
        phone,
        phoneOTP: otp,
        phoneOTPExpires: { $gt: Date.now() }
      });
    } else {
      // For contractors, verify email OTP
      user = await User.findOne({
        email,
        emailOTP: otp,
        emailOTPExpires: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired OTP'
      });
    }

    user.isVerified = true;
    
    // Clear the appropriate OTP fields based on user type
    if (user.role === 'farmer') {
      user.phoneOTP = undefined;
      user.phoneOTPExpires = undefined;
    } else {
      user.emailOTP = undefined;
      user.emailOTPExpires = undefined;
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Verification successful'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'OTP verification failed'
    });
  }
};



const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "ACF Contractor Email Verification - Resend",
      text: `Your new OTP is ${otp}. It is valid for 10 minutes.`
    });

    res.status(200).json({
      status: 'success',
      message: 'OTP resent successfully'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during OTP resend'
    });
  }
};

const updatePreferredLanguage = async (req, res) => {
  try {
    const { preferredLanguage } = req.body;
    const supportedLanguages = ['en', 'hi', 'te', 'ta', 'kn', 'ml'];

    if (!supportedLanguages.includes(preferredLanguage)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid preferred language'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { preferredLanguage },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Update preferred language error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating preferred language'
    });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfileImage,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP,
  sendOTP,
  updatePreferredLanguage
};
