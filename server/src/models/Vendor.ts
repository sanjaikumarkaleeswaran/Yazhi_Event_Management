import mongoose, { Schema, Document } from 'mongoose';

export enum VendorStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  BLACKLISTED = 'Blacklisted',
}

export interface IVendor extends Document {
  vendorCode: string;
  businessName: string;
  ownerName: string;
  category: string;
  servicesOffered: string[];
  primaryContact: string;
  secondaryContact?: string;
  email?: string;
  address?: string;
  city: string;
  state?: string;
  gstNumber?: string;
  experienceYears?: number;
  rating: number;
  availabilityStatus: 'Available' | 'Busy' | 'Unavailable';
  workingAreas: string[];
  pricingStructure?: string;
  portfolioImages: string[];
  contractFiles: string[];
  documents: { name: string; url: string; uploadedAt: Date }[];
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  paymentTerms?: string;
  status: VendorStatus;
  notes?: string;
  timeline: { action: string; description: string; date: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema: Schema<IVendor> = new Schema(
  {
    vendorCode: { type: String, required: true, unique: true, index: true },
    businessName: { type: String, required: true, trim: true, index: true },
    ownerName: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, index: true },
    servicesOffered: [{ type: String }],
    primaryContact: { type: String, required: true, index: true },
    secondaryContact: { type: String },
    email: { type: String, lowercase: true, index: true },
    address: { type: String },
    city: { type: String, required: true, index: true },
    state: { type: String },
    gstNumber: { type: String },
    experienceYears: { type: Number, min: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0, index: true },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Busy', 'Unavailable'],
      default: 'Available',
      index: true
    },
    workingAreas: [{ type: String }],
    pricingStructure: { type: String },
    portfolioImages: [{ type: String }],
    contractFiles: [{ type: String }],
    documents: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    paymentTerms: { type: String },
    status: {
      type: String,
      enum: Object.values(VendorStatus),
      default: VendorStatus.ACTIVE,
      index: true
    },
    notes: { type: String },
    timeline: [{
      action: String,
      description: String,
      date: { type: Date, default: Date.now }
    }],
  },
  {
    timestamps: true,
  }
);

vendorSchema.index({ createdAt: -1 });

export default mongoose.model<IVendor>('Vendor', vendorSchema);
