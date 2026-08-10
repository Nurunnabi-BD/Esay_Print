const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      return res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          studentId: user.studentId,
          semester: user.semester,
          department: user.department,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving user profile' 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      // Update non-sensitive fields
      user.name = req.body.name || user.name;
      user.semester = req.body.semester || user.semester;
      user.department = req.body.department || user.department;

      // Allow changing password
      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
          });
        }
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      return res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          studentId: updatedUser.studentId,
          semester: updatedUser.semester,
          department: updatedUser.department,
          email: updatedUser.email,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt
        }
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error updating user profile' 
    });
  }
};

module.exports = { getUserProfile, updateUserProfile };
