const { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
require('dotenv').config();

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
          profileComplete: user.profileComplete
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
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // In a real app, send reset email here
    // For now, we'll return the token in the response
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to your email',
      data: { resetToken }
    });
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
    const { email } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP temporarily in DB (without full account)
    const tempUser = new User({
      name: "temp",
      email,
      phone: "0000000000",
      password: "temp",
      role: "contractor",
      emailOTP: otp,
      emailOTPExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
      isVerified: false
    });

    await tempUser.save();

    await sendEmail({
      to: email,
      subject: "Your OTP Verification Code",
      text: `Your OTP is ${otp}`
    });

    res.status(200).json({
      status: 'success',
      message: 'OTP sent to email'
    });

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
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      emailOTP: otp,
      emailOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired OTP'
      });
    }

    user.isVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });

  } catch (error) {
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

    await sendEmail(
      user.email,
      "ACF Contractor Email Verification - Resend",
      `Your new OTP is ${otp}. It is valid for 10 minutes.`
    );

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


module.exports = {
  register,
  login,
  getProfile,
  updateProfileImage,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP
};