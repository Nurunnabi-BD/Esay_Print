const User = require('../models/User');
const generateToken = require('../utils/jwt');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, studentId, semester, department, email, password } = req.body;

    // Validation
    if (!name || !studentId || !semester || !department || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all fields' 
      });
    }

    // Check if user exists (email or studentId)
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    const idExists = await User.findOne({ studentId });
    if (idExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student ID already registered' 
      });
    }

    // Auto-promote first user to Admin for local/dev setup convenience
    const userCount = await User.countDocuments({});
    const role = userCount === 0 ? 'admin' : 'user';

    const user = await User.create({
      name,
      studentId,
      semester,
      department,
      email,
      password,
      role
    });

    if (user) {
      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          studentId: user.studentId,
          semester: user.semester,
          department: user.department,
          email: user.email,
          role: user.role
        }
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user data' 
      });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find user and explicitly select password
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      return res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          studentId: user.studentId,
          semester: user.semester,
          department: user.department,
          email: user.email,
          role: user.role
        }
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  return res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Fetch me error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching user details' 
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getMe };
