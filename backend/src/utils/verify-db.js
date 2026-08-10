require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('ERROR: MONGODB_URI is not defined in the environment variables.');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB Atlas...');

mongoose.connect(uri)
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB Atlas successfully.');
    console.log('Checking database collections list...');
    return mongoose.connection.db.listCollections().toArray();
  })
  .then((collections) => {
    console.log('Collections available:');
    collections.forEach(col => console.log(` - ${col.name}`));
    console.log('All checks passed successfully.');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILURE: Could not connect to MongoDB Atlas.');
    console.error(err);
    process.exit(1);
  });
