import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI is not defined.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    const email = 'admin@yazhievents.com';
    const password = 'password123'; // In a real app, change this immediately

    await User.deleteMany({ email });
    console.log('🗑️ Cleared existing admin user if any.');

    await User.create({
      firstName: 'Yazhi',
      lastName: 'Admin',
      email,
      password,
      role: 'Super Admin',
    });

    console.log(`🎉 Admin user created!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
