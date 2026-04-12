require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const email = 'khushichauhan9850@gmail.com';
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('\n📋 User Details:');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Is Blocked:', user.isBlocked);
    console.log('Is Active:', user.isActive);
    console.log('Phone Verified:', user.phoneVerified);

    // Test password
    const isMatch = await user.matchPassword('Khushi@123');
    console.log('\n🔐 Password Match:', isMatch ? '✅ Correct' : '❌ Wrong');

    if (user.role !== 'admin') {
      console.log('\n⚠️  Role is not admin. Updating...');
      user.role = 'admin';
      await user.save();
      console.log('✅ Role updated to admin');
    } else {
      console.log('\n✅ User is already admin');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAdmin();
