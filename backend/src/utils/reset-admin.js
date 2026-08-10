require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const resetAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('ERROR: MONGODB_URI is not set in env.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas to reset admin password...');
    await mongoose.connect(process.env.MONGODB_URI);

    const adminUser = await User.findOne({ email: 'nurunnabi5572@gmail.com' });
    if (!adminUser) {
      console.error('ERROR: Admin user nurunnabi5572@gmail.com not found.');
      mongoose.connection.close();
      process.exit(1);
    }

    // Set new password (pre-save hook will hash it)
    adminUser.password = 'adminpassword123';
    await adminUser.save();

    console.log('\nSUCCESS: Password updated for admin account.');
    console.log('-------------------------------------');
    console.log('Email:    nurunnabi5572@gmail.com');
    console.log('Password: adminpassword123');
    console.log('-------------------------------------\n');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failure resetting admin password:', error);
    process.exit(1);
  }
};

resetAdmin();
