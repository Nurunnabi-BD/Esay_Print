require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('ERROR: MONGODB_URI is not set in env.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas to seed admin...');
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('NOTICE: An admin account already exists in the database.');
      console.log(`Email: ${adminExists.email}`);
      console.log('If you forgot the password, please register another or edit the DB.');
      mongoose.connection.close();
      process.exit(0);
    }

    // Create default admin
    const defaultAdmin = new User({
      name: 'System Administrator',
      studentId: 'ADMIN-001',
      department: 'SYS',
      semester: 'N/A',
      email: 'admin@smartprint.com',
      password: 'adminpassword123', // Pre-save hook hashes this
      role: 'admin'
    });

    await defaultAdmin.save();

    console.log('\nSUCCESS: Default Admin Account Seeded.');
    console.log('-------------------------------------');
    console.log('Email:    admin@smartprint.com');
    console.log('Password: adminpassword123');
    console.log('-------------------------------------\n');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failure seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
