import mongoose, { Schema, Document } from 'mongoose';

export enum InquiryStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  QUALIFIED = 'Qualified',
  QUOTATION_SENT = 'Quotation Sent',
  NEGOTIATION = 'Negotiation',
  CONVERTED = 'Converted',
  REJECTED = 'Rejected',
  ARCHIVED = 'Archived',
}

export enum LeadSource {
  WEBSITE = 'Website',
  WHATSAPP = 'WhatsApp',
  PHONE = 'Phone',
  INSTAGRAM = 'Instagram',
  FACEBOOK = 'Facebook',
  REFERRAL = 'Referral',
  WALK_IN = 'Walk-in'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface IInquiry extends Document {
  inquiryNumber: string;
  clientId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: Date;
  city: string;
  location?: string;
  message: string;
  budget?: number;
  status: InquiryStatus;
  source: LeadSource;
  priority: Priority;
  assignedStaff?: mongoose.Types.ObjectId;
  followUpDate?: Date;
  internalNotes?: string;
  bookingId?: mongoose.Types.ObjectId;
  timeline: { action: string; description: string; date: Date }[];
  attachments: { name: string; url: string; uploadedAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema: Schema<IInquiry> = new Schema(
  {
    inquiryNumber: { type: String, required: true, unique: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', index: true },
    name: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    eventType: { type: String, required: true, trim: true, index: true },
    eventDate: { type: Date, required: true, index: true },
    city: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    message: { type: String, trim: true },
    budget: { type: Number, min: 0 },
    status: {
      type: String,
      enum: Object.values(InquiryStatus),
      default: InquiryStatus.NEW,
      index: true,
    },
    source: {
      type: String,
      enum: Object.values(LeadSource),
      default: LeadSource.WEBSITE,
      index: true
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
      index: true
    },
    assignedStaff: { type: Schema.Types.ObjectId, ref: 'TeamMember', index: true },
    followUpDate: { type: Date, index: true },
    internalNotes: { type: String, trim: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    timeline: [{
      action: String,
      description: String,
      date: { type: Date, default: Date.now }
    }],
    attachments: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  {
    timestamps: true,
  }
);

// Index for sorting by date (most recent first)
inquirySchema.index({ createdAt: -1 });

export default mongoose.model<IInquiry>('Inquiry', inquirySchema);
