import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  companyName: string;
  logo: string;
  favicon: string;
  businessEmail: string;
  businessPhone: string;
  website: string;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  enableMaintenanceMode: boolean;
  businessAddress: string;
  googleMapsUrl: string;
  gstNumber: string;
  panNumber: string;
  instagram: string;
  facebook: string;
  youtube: string;
  linkedIn: string;
  whatsappNumber: string;
  emergencyContact: string;
  businessDescription: string;
  bookingPrefix: string;
  defaultBookingDuration: number;
  workingHours: string;
  workingDays: string[];
  maximumBookingsPerDay: number;
  bufferTime: number;
  bookingConfirmationPolicy: string;
  cancellationPolicy: string;
  refundPolicy: string;
  defaultEventStatus: string;
  defaultPaymentStatus: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
  depositPercentage: number;
  invoicePrefix: string;
  invoiceFooter: string;
  invoiceNotes: string;
  taxPercentage: number;
  lateFee: number;
  enableOnlinePayment: boolean;
  enableCashPayment: boolean;
  enableBankTransfer: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enableEmailNotifications: boolean;
  whatsappBusinessNumber: string;
  whatsappApiToken: string;
  webhookUrl: string;
  verifyToken: string;
  enableWhatsApp: boolean;
  dryRunMode: boolean;
  cloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  uploadFolder: string;
  maxUploadSize: number;
  allowedFileTypes: string[];
  enableImageCompression: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  sidebarStyle: string;
  darkMode: boolean;
  lightMode: boolean;
  fontSelection: string;
  borderRadius: number;
  animationsEnabled: boolean;
  jwtExpiry: number;
  refreshTokenExpiry: number;
  sessionTimeout: number;
  passwordLength: number;
  passwordComplexity: string;
  maxLoginAttempts: number;
  accountLockDuration: number;
  enableTwoFactorAuthentication: boolean;
  enableAuditLogs: boolean;
  enableIpLogging: boolean;
  updatedAt: Date;
  createdAt: Date;
}

const settingSchema: Schema<ISetting> = new Schema(
  {
    companyName: { type: String, default: 'Yazhi Event Management' },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    businessEmail: { type: String, default: 'hello@yazhievents.com' },
    businessPhone: { type: String, default: '+91 9876543210' },
    website: { type: String, default: 'https://yazhievents.com' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    timeFormat: { type: String, default: '24h' },
    enableMaintenanceMode: { type: Boolean, default: false },
    businessAddress: { type: String, default: 'Tiruppur, Tamil Nadu' },
    googleMapsUrl: { type: String, default: 'https://maps.google.com/' },
    gstNumber: { type: String, default: '' },
    panNumber: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' },
    linkedIn: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    businessDescription: { type: String, default: 'Premium event management for unforgettable experiences.' },
    bookingPrefix: { type: String, default: 'YAZHI' },
    defaultBookingDuration: { type: Number, default: 240 },
    workingHours: { type: String, default: '09:00-18:00' },
    workingDays: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    maximumBookingsPerDay: { type: Number, default: 10 },
    bufferTime: { type: Number, default: 30 },
    bookingConfirmationPolicy: { type: String, default: 'Booking confirmed upon payment receipt.' },
    cancellationPolicy: { type: String, default: 'Cancellations are subject to policy terms.' },
    refundPolicy: { type: String, default: 'Refunds are evaluated on a case-by-case basis.' },
    defaultEventStatus: { type: String, default: 'Pending' },
    defaultPaymentStatus: { type: String, default: 'Pending' },
    razorpayKeyId: { type: String, default: '' },
    razorpayKeySecret: { type: String, default: '' },
    razorpayWebhookSecret: { type: String, default: '' },
    depositPercentage: { type: Number, default: 30 },
    invoicePrefix: { type: String, default: 'INV' },
    invoiceFooter: { type: String, default: 'Thank you for choosing Yazhi Events.' },
    invoiceNotes: { type: String, default: '' },
    taxPercentage: { type: Number, default: 5 },
    lateFee: { type: Number, default: 0 },
    enableOnlinePayment: { type: Boolean, default: true },
    enableCashPayment: { type: Boolean, default: true },
    enableBankTransfer: { type: Boolean, default: true },
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUsername: { type: String, default: '' },
    smtpPassword: { type: String, default: '' },
    fromEmail: { type: String, default: 'hello@yazhievents.com' },
    fromName: { type: String, default: 'Yazhi Events' },
    enableEmailNotifications: { type: Boolean, default: true },
    whatsappBusinessNumber: { type: String, default: '' },
    whatsappApiToken: { type: String, default: '' },
    webhookUrl: { type: String, default: '' },
    verifyToken: { type: String, default: '' },
    enableWhatsApp: { type: Boolean, default: false },
    dryRunMode: { type: Boolean, default: true },
    cloudName: { type: String, default: '' },
    cloudinaryApiKey: { type: String, default: '' },
    cloudinaryApiSecret: { type: String, default: '' },
    uploadFolder: { type: String, default: 'yazhi-events' },
    maxUploadSize: { type: Number, default: 10000 },
    allowedFileTypes: { type: [String], default: ['jpg', 'jpeg', 'png', 'webp'] },
    enableImageCompression: { type: Boolean, default: true },
    primaryColor: { type: String, default: '#C89B3C' },
    secondaryColor: { type: String, default: '#5A1E1E' },
    accentColor: { type: String, default: '#F6E8C7' },
    sidebarStyle: { type: String, default: 'glass' },
    darkMode: { type: Boolean, default: true },
    lightMode: { type: Boolean, default: true },
    fontSelection: { type: String, default: 'Inter' },
    borderRadius: { type: Number, default: 16 },
    animationsEnabled: { type: Boolean, default: true },
    jwtExpiry: { type: Number, default: 86400 },
    refreshTokenExpiry: { type: Number, default: 2592000 },
    sessionTimeout: { type: Number, default: 1800 },
    passwordLength: { type: Number, default: 8 },
    passwordComplexity: { type: String, default: 'medium' },
    maxLoginAttempts: { type: Number, default: 5 },
    accountLockDuration: { type: Number, default: 900 },
    enableTwoFactorAuthentication: { type: Boolean, default: false },
    enableAuditLogs: { type: Boolean, default: true },
    enableIpLogging: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Setting = mongoose.model<ISetting>('Setting', settingSchema);

export default Setting;
