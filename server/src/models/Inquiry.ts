import mongoose, { Schema, Document } from 'mongoose';

export enum InquiryStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IInquiry extends Document {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: Date;
  city: string;
  message: string;
  status: InquiryStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema: Schema<IInquiry> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(InquiryStatus),
      default: InquiryStatus.NEW,
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for sorting by date (most recent first)
inquirySchema.index({ createdAt: -1 });

export default mongoose.model<IInquiry>('Inquiry', inquirySchema);
