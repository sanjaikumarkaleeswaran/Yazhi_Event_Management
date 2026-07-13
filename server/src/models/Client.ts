import mongoose, { Schema, Document } from 'mongoose';

export enum ClientStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  LEAD = 'Lead'
}

export interface IClient extends Document {
  clientCode: string;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  dob?: Date;
  anniversary?: Date;
  profilePhoto?: string;
  company?: string;
  preferredLanguage?: string;
  preferredContactMethod?: 'Email' | 'Phone' | 'WhatsApp';
  tags?: string[];
  isVIP: boolean;
  notes?: string;
  status: ClientStatus;
  customerSince: Date;
  timeline: { action: string; description: string; date: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema: Schema<IClient> = new Schema(
  {
    clientCode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    alternatePhone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true, index: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    dob: { type: Date },
    anniversary: { type: Date },
    profilePhoto: { type: String },
    company: { type: String, trim: true },
    preferredLanguage: { type: String, default: 'English' },
    preferredContactMethod: { 
      type: String, 
      enum: ['Email', 'Phone', 'WhatsApp'], 
      default: 'Phone' 
    },
    tags: [{ type: String, trim: true }],
    isVIP: { type: Boolean, default: false, index: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(ClientStatus),
      default: ClientStatus.ACTIVE,
      index: true
    },
    customerSince: { type: Date, default: Date.now, index: true },
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

clientSchema.index({ createdAt: -1 });

export default mongoose.model<IClient>('Client', clientSchema);
