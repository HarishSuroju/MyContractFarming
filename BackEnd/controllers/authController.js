const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const crypto = require('crypto');
const { sendOTP, sendWelcomeEmail } = require('../services/emailService');

// In-memory storage for OTP attempts (use Redis in production)
const otpAttempts = new Map();
const otpRequests = new Map();


// Register a new user
const registerUser = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { name, email, role, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and role are required'
      });
    }

    // Validate role
    if (!['farmer', 'contractor'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be either farmer or contractor'
      });
    }

    // For contractors, password is not required during initial registration (collected after OTP)
    // For farmers, password is required
    if (role === 'farmer' && !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required for farmer registration'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    let hashedPassword = null;
    if (password) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Generate OTP for contractors only
    let otp = null;
    let otpExpires = null;
    if (role === 'contractor') {
      // Rate limiting: Check if too many OTP requests from this email
      const now = Date.now();
      const emailKey = `otp_${email}`;
      const requestData = otpRequests.get(emailKey);

      if (requestData && (now - requestData.timestamp) < 60000) { // 1 minute cooldown
        return res.status(429).json({
          status: 'error',
          message: 'Please wait before requesting another OTP'
        });
      }

      otp = crypto.randomInt(100000, 999999).toString();
      otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store request timestamp
      otpRequests.set(emailKey, { timestamp: now });
    }

    // Create user
    const user = new User({
      name,
      email,
      role,
      password: hashedPassword,
      phone,
      isVerified: role !== 'contractor', // Farmers are verified by default, contractors need OTP
      otp,
      otpExpires
    });

    await user.save();

    // Send OTP for contractors
    if (role === 'contractor') {
      try {
        await sendOTP(email, otp);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        // Don't fail registration if email fails, but log it
        // User can request OTP again later
      }
    }

    // Send OTP for contractors
    if (role === 'contractor') {
      try {
        await sendOTP(email, otp);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        // Don't fail registration if email fails, but log it
        // User can request OTP again later
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      message: role === 'contractor'
        ? 'OTP sent to your email. Please verify your account.'
        : 'Account created successfully. You can now login.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during registration'
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    //check if contractor is verified
    if(user.role==='contractor' && !user.isVerified){
      return res.status(400).json({
        status: 'error',
        message: 'Please verify your email first'
      });
    }
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
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
          role: user.role
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

// Get user profile
const getUserProfile = async (req, res) => {
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

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and OTP are required'
      });
    }

    // Check attempt rate limiting
    const attemptKey = `attempt_${email}`;
    const attempts = otpAttempts.get(attemptKey) || { count: 0, timestamp: Date.now() };

    // Reset attempts if more than 5 minutes have passed
    if (Date.now() - attempts.timestamp > 5 * 60 * 1000) {
      attempts.count = 0;
      attempts.timestamp = Date.now();
    }

    if (attempts.count >= 5) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: new Date() },
      role: 'contractor'
    });

    if (!user) {
      // Increment failed attempts
      attempts.count++;
      otpAttempts.set(attemptKey, attempts);

      return res.status(400).json({
        status: 'error',
        message: `Invalid or expired OTP. ${5 - attempts.count} attempts remaining.`
      });
    }

    // Validate password for contractors
    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required'
      });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Clear attempt tracking
    otpAttempts.delete(attemptKey);

    // Send welcome email
    try {
      await sendWelcomeEmail(email, user.name, password);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    res.status(200).json({
      status: 'success',
      message: 'Account verified successfully. Welcome email sent!'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during verification'
    });
  }
};

// Resend OTP for contractors
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    // Rate limiting: Check if too many resend requests
    const now = Date.now();
    const emailKey = `resend_${email}`;
    const resendData = otpRequests.get(emailKey);

    if (resendData && (now - resendData.timestamp) < 60000) { // 1 minute cooldown
      return res.status(429).json({
        status: 'error',
        message: 'Please wait before requesting another OTP'
      });
    }

    const user = await User.findOne({ email, role: 'contractor' });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Contractor account not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Account is already verified'
      });
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Store resend timestamp
    otpRequests.set(emailKey, { timestamp: now });

    // Send OTP email
    try {
      await sendOTP(email, otp);
    } catch (emailError) {
      console.error('Failed to resend OTP email:', emailError);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'OTP resent successfully to your email'
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
  registerUser,
  loginUser,
  getUserProfile,
  verifyOTP,
  resendOTP
};