import mongoose, { Schema, Document } from 'mongoose';

export enum BookingStatus {
  CONFIRMED = 'Confirmed',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  RESCHEDULED = 'Rescheduled',
}



export enum PaymentStatus {
  PENDING = 'Pending',
  PARTIALLY_PAID = 'Partially Paid',
  PAID = 'Paid',
  REFUNDED = 'Refunded',
}

export enum EventPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface IBooking extends Document {
  bookingNumber: string;
  clientId?: mongoose.Types.ObjectId;
  clientName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: Date;
  venue?: string;
  packageName?: string;
  guestCount?: number;
  eventBudget?: number;
  amount: number;
  advancePaid: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  eventPriority: EventPriority;
  notes?: string;
  internalNotes?: string;
  invoiceReference?: string;
  reminderDates?: Date[];
  assignedTeam: mongoose.Types.ObjectId[];
  assignedVendors: mongoose.Types.ObjectId[];
  documents: { name: string; url: string; uploadedAt: Date }[];
  invoices: { invoiceNumber: string; amount: number; status: string; url: string }[];
  timeline: { action: string; description: string; date: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema: Schema<IBooking> = new Schema(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', index: true },
    clientName: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    eventType: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true, index: true },
    venue: { type: String, trim: true },
    packageName: { type: String, trim: true },
    guestCount: { type: Number, min: 0 },
    eventBudget: { type: Number, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    advancePaid: { type: Number, default: 0, min: 0 },
    status: { 
      type: String, 
      enum: Object.values(BookingStatus), 
      default: BookingStatus.PENDING,
      index: true
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true
    },
    eventPriority: {
      type: String,
      enum: Object.values(EventPriority),
      default: EventPriority.MEDIUM
    },
    notes: { type: String, trim: true },
    internalNotes: { type: String, trim: true },
    invoiceReference: { type: String, trim: true },
    reminderDates: [{ type: Date }],
    assignedTeam: [{ type: Schema.Types.ObjectId, ref: 'TeamMember' }],
    assignedVendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }],
    documents: [{ 
      name: String, 
      url: String, 
      uploadedAt: { type: Date, default: Date.now } 
    }],
    invoices: [{ 
      invoiceNumber: String, 
      amount: Number, 
      status: String, 
      url: String 
    }],
    timeline: [{ 
      action: String, 
      description: String, 
      date: { type: Date, default: Date.now } 
    }]
  },
  {
    timestamps: true,
  }
);

bookingSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

export default mongoose.model<IBooking>('Booking', bookingSchema);
