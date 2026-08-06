import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_APIKEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_APISECRET || '',
  secure: true,
});

export default cloudinary;
