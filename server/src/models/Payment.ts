import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  paymentNumber: string;
  bookingId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  invoiceId?: string;
  amount: number;
  advanceAmount: number;
  remainingAmount: number;
  discount: number;
  tax: number;
  gst: number;
  convenienceFee: number;
  currency: string;
  paymentMethod: string; // 'Cash', 'UPI', 'Card', 'Net Banking', 'Cheque', 'Bank Transfer', 'Razorpay'
  transactionId?: string;
  gateway?: string; // 'Razorpay', 'Manual'
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  paymentDate?: Date;
  dueDate?: Date;
  status: string; // 'Pending', 'Partially Paid', 'Paid', 'Failed', 'Cancelled', 'Refunded'
  refundStatus?: string;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  timeline?: { action: string; description: string; date: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    paymentNumber: { type: String, required: true, unique: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    invoiceId: { type: String },
    amount: { type: Number, required: true },
    advanceAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    convenienceFee: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    paymentMethod: { 
      type: String, 
      enum: ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque', 'Bank Transfer', 'Razorpay'],
      required: true
    },
    transactionId: { type: String },
    gateway: { type: String, default: 'Manual' },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    gatewaySignature: { type: String },
    paymentDate: { type: Date },
    dueDate: { type: Date },
    status: { 
      type: String, 
      enum: ['Pending', 'Partially Paid', 'Paid', 'Failed', 'Cancelled', 'Refunded'],
      default: 'Pending'
    },
    refundStatus: { type: String },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    timeline: [
      {
        action: { type: String },
        description: { type: String },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ clientId: 1 });
paymentSchema.index({ status: 1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);
