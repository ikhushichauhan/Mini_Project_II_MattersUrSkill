const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const User = require('./models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('\nAdmin User Creation\n');

    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 6 chars): ');
    const dateOfBirth = await question('Enter date of birth (YYYY-MM-DD): ');

    if (!name || !email || !password || !dateOfBirth) {
      console.log('All fields are required!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('Password must be at least 6 characters!');
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingAdmin) {
      console.log('User with this email already exists!');
      process.exit(1);
    }

    const admin = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'admin',
      dateOfBirth: new Date(dateOfBirth),
      phoneVerified: true,
      isActive: true,
      isApproved: true,
      isVerified: true,
    });

    console.log('\nAdmin user created successfully!');
    console.log('\nAdmin Details:');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin._id}`);
    console.log('\nKeep these credentials safe!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();

