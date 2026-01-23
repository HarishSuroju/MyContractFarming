const { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });

    await user.save();

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // In a real app, send verification email here
    // For now, we'll mark the user as verified automatically
    user.isVerified = true;
    await user.save();

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during registration'
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
    // This would typically handle profile image uploads
    // For now, we'll return a placeholder response
    res.status(501).json({
      status: 'error',
      message: 'Profile image upload not implemented'
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating profile image'
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

const verifyOTP = async (req, res) => {
  try {
    // For now, this is a placeholder
    res.status(501).json({
      status: 'error',
      message: 'OTP verification not implemented'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during OTP verification'
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    // For now, this is a placeholder
    res.status(501).json({
      status: 'error',
      message: 'Resend OTP not implemented'
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