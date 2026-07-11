import mongoose, { Schema, Document } from 'mongoose';

export enum BookingStatus {
  CONFIRMED = 'Confirmed',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  RESCHEDULED = 'Rescheduled',
}

export interface IBooking extends Document {
  clientName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: Date;
  venue?: string;
  packageName?: string;
  amount: number;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema: Schema<IBooking> = new Schema(
  {
    clientName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    venue: { type: String, trim: true },
    packageName: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: Object.values(BookingStatus), 
      default: BookingStatus.PENDING 
    },
    notes: { type: String, trim: true }
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
