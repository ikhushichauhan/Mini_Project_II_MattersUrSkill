const mongoose = require('mongoose');

mongodb_listeners();

function mongodb_listeners() {
  mongoose.connection.on('connected', () => {
    console.log('  Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`  Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('   Mongoose disconnected from MongoDB');
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('  MongoDB connection closed due to app termination (SIGINT)');
    process.exit(0);
  });
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `   MongoDB Connected: ${conn.connection.host} ` +
      `(DB: ${conn.connection.name})`
    );
  } catch (error) {
    console.error(`  MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit process with failure so the server does not start
  }
};

module.exports = connectDB;