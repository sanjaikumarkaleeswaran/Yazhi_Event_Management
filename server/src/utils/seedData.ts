import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Package, { PackageTier } from '../models/Package';
import Testimonial from '../models/Testimonial';
import GalleryItem from '../models/GalleryItem';
import TeamMember from '../models/TeamMember';

dotenv.config();

const packages = [
  {
    title: 'Silver Package',
    eventType: 'Wedding',
    tier: PackageTier.SILVER,
    startingPrice: 50000,
    features: ['Basic Stage Decoration', 'Standard Photography', 'Welcome Drinks', 'Guest Seating (up to 100)'],
    isPopular: false,
  },
  {
    title: 'Gold Package',
    eventType: 'Wedding',
    tier: PackageTier.GOLD,
    startingPrice: 150000,
    features: ['Premium Stage Decoration', 'Candid & Traditional Photography', 'Full Catering Setup', 'Guest Seating (up to 300)'],
    isPopular: true,
  },
  {
    title: 'Platinum Package',
    eventType: 'Wedding',
    tier: PackageTier.PLATINUM,
    startingPrice: 300000,
    features: ['Luxury Stage Decoration', 'Pre-Wedding Shoot', 'Full Catering Setup', 'DJ & Entertainment', 'Guest Seating (up to 500+)'],
    isPopular: false,
  },
];

const testimonials = [
  {
    clientName: 'Rahul & Priya',
    eventType: 'Wedding',
    message: 'Yazhi Events made our wedding a magical experience! The decorations were exactly what we dreamed of, and the team handled everything flawlessly.',
    rating: 5,
    isApproved: true,
  },
  {
    clientName: 'Karthik',
    eventType: 'Birthday',
    message: 'We hired them for my daughter\'s first birthday. The theme was executed perfectly. Highly recommended!',
    rating: 5,
    isApproved: true,
  },
  {
    clientName: 'Meera',
    eventType: 'Valaikappu',
    message: 'Such a professional and warm team. The traditional setup for my baby shower was beautiful.',
    rating: 4,
    isApproved: true,
  },
  {
    clientName: 'Vikram',
    eventType: 'Corporate',
    message: 'Good arrangements for our annual meet. There were a few minor delays, but overall a great experience.',
    rating: 4,
    isApproved: true,
  },
];

const gallery = [
  { title: 'Grand Muhurtham', imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600', publicId: 'demo/1', eventType: 'Wedding', altText: 'Traditional Tamil Wedding Ceremony', tags: ['muhurtham', 'wedding'], isFeatured: true, order: 1 },
  { title: 'Reception Stage', imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600', publicId: 'demo/2', eventType: 'Wedding', altText: 'Elegant Reception Stage', tags: ['reception', 'decor'], isFeatured: true, order: 2 },
  { title: 'First Birthday', imageUrl: 'https://images.unsplash.com/photo-1530103862676-de88b635fd4f?q=80&w=600', publicId: 'demo/3', eventType: 'Birthday', altText: 'Kids Birthday Party', tags: ['birthday', 'kids'], isFeatured: false, order: 3 },
  { title: 'Valaikappu Setup', imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600', publicId: 'demo/4', eventType: 'Valaikappu', altText: 'Baby Shower Setup', tags: ['valaikappu', 'traditional'], isFeatured: false, order: 4 },
];

const team = [
  { 
    employeeId: 'EMP-10001',
    firstName: 'Sanjay', 
    lastName: 'Kumar', 
    email: 'sanjay@yazhievents.com',
    phone: '9876543210',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300', 
    department: 'Operations',
    designation: 'Lead Event Manager',
    skills: ['Logistics', 'Budgeting', 'Vendor Management'],
    experience: 10,
    joiningDate: new Date('2022-01-15'),
    salary: 80000,
    availabilityStatus: 'Available',
    employmentStatus: 'Full-time',
    workingHours: 40,
    leaveBalance: 15,
    ratings: 5,
    timeline: [{ action: 'Employee Created', description: 'Initial onboarding', date: new Date('2022-01-15') }]
  },
  { 
    employeeId: 'EMP-10002',
    firstName: 'Ananya', 
    lastName: 'Rao', 
    email: 'ananya@yazhievents.com',
    phone: '9876543211',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300', 
    department: 'Design',
    designation: 'Creative Director',
    skills: ['Stage Design', 'Aesthetics', 'Floral Arrangement'],
    experience: 6,
    joiningDate: new Date('2023-03-10'),
    salary: 65000,
    availabilityStatus: 'Available',
    employmentStatus: 'Full-time',
    workingHours: 40,
    leaveBalance: 12,
    ratings: 5,
    timeline: [{ action: 'Employee Created', description: 'Initial onboarding', date: new Date('2023-03-10') }]
  },
  { 
    employeeId: 'EMP-10003',
    firstName: 'Kannan', 
    lastName: 'Subramanian', 
    email: 'kannan@yazhievents.com',
    phone: '9876543212',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300', 
    department: 'Operations',
    designation: 'Head of Operations',
    skills: ['Sourcing', 'Logistics', 'Supervision'],
    experience: 8,
    joiningDate: new Date('2021-06-01'),
    salary: 70000,
    availabilityStatus: 'Available',
    employmentStatus: 'Full-time',
    workingHours: 40,
    leaveBalance: 18,
    ratings: 4,
    timeline: [{ action: 'Employee Created', description: 'Initial onboarding', date: new Date('2021-06-01') }]
  }
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI is not defined. Cannot seed data.');
      process.exit(1);
    }

    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected.');

    console.log('🗑️ Clearing existing public collections...');
    await Package.deleteMany();
    await Testimonial.deleteMany();
    await GalleryItem.deleteMany();
    await TeamMember.deleteMany();

    console.log('🌱 Seeding Packages...');
    await Package.insertMany(packages);

    console.log('🌱 Seeding Testimonials...');
    await Testimonial.insertMany(testimonials);

    console.log('🌱 Seeding Gallery...');
    await GalleryItem.insertMany(gallery);

    console.log('🌱 Seeding Team...');
    await TeamMember.insertMany(team);

    console.log('🎉 Data successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
