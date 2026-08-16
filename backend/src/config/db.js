const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error('Database URI is missing. Please set MONGODB_URI or MONGO_URI in your environment variables.');
    }
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop stale legacy indexes if present
    try {
      const ordersCollection = mongoose.connection.collection('orders');
      const indexes = await ordersCollection.indexes();
      for (const idx of indexes) {
        if (idx.name === 'orderNumber_1') {
          await ordersCollection.dropIndex('orderNumber_1');
          console.log("Successfully removed stale index 'orderNumber_1'");
        }
      }
    } catch (idxErr) {
      // Ignore if index doesn't exist or collection hasn't been created yet
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
