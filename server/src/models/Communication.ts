import mongoose, { Document, Schema } from 'mongoose';

export type CommunicationType = 'Email' | 'SMS' | 'WhatsApp';
export type CommunicationStatus = 'Queued' | 'Sent' | 'Delivered' | 'Failed' | 'Read';

export interface ICommunication extends Document {
  type: CommunicationType;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  message: string;
  template?: string;
  status: CommunicationStatus;
  bookingId?: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  inquiryId?: mongoose.Types.ObjectId;
  sentBy?: mongoose.Types.ObjectId;
  sentAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const communicationSchema = new Schema<ICommunication>({
  type: { type: String, enum: ['Email', 'SMS', 'WhatsApp'], required: true, index: true },
  recipientName: { type: String, required: true, trim: true },
  recipientEmail: { type: String, trim: true, lowercase: true },
  recipientPhone: { type: String, trim: true },
  subject: { type: String, trim: true },
  message: { type: String, required: true },
  template: { type: String, trim: true },
  status: { type: String, enum: ['Queued', 'Sent', 'Delivered', 'Failed', 'Read'], default: 'Queued', index: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', index: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', index: true },
  inquiryId: { type: Schema.Types.ObjectId, ref: 'Inquiry', index: true },
  sentBy: { type: Schema.Types.ObjectId, ref: 'User' },
  sentAt: Date,
  errorMessage: String,
}, { timestamps: true });

communicationSchema.index({ createdAt: -1 });
communicationSchema.index({ recipientName: 'text', recipientEmail: 'text', recipientPhone: 'text', subject: 'text', message: 'text' });

export default mongoose.model<ICommunication>('Communication', communicationSchema);
