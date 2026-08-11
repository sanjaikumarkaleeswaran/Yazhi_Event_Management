import mongoose, { Document, Schema } from 'mongoose';

export type CommunicationChannel = 'email' | 'whatsapp' | 'sms' | 'in_app';
export type CommunicationLogStatus = 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'cancelled';

export interface ICommunicationLog extends Document {
  clientId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  inquiryId?: mongoose.Types.ObjectId;
  channel: CommunicationChannel;
  templateId?: mongoose.Types.ObjectId;
  recipient: string;
  subject?: string;
  messagePreview?: string;
  status: CommunicationLogStatus;
  provider?: string;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  retryCount: number;
  lastAttemptAt?: Date;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
  isTest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const communicationLogSchema = new Schema<ICommunicationLog>({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', index: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', index: true },
  inquiryId: { type: Schema.Types.ObjectId, ref: 'Inquiry', index: true },
  channel: { type: String, enum: ['email', 'whatsapp', 'sms', 'in_app'], required: true, index: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'MessageTemplate' },
  recipient: { type: String, required: true, trim: true },
  subject: { type: String, trim: true },
  messagePreview: { type: String, trim: true, maxlength: 500 },
  status: { type: String, enum: ['queued', 'sending', 'sent', 'delivered', 'failed', 'cancelled'], default: 'queued', index: true },
  provider: { type: String, trim: true },
  providerMessageId: { type: String, trim: true },
  errorCode: { type: String, trim: true },
  errorMessage: { type: String, trim: true },
  sentAt: Date,
  deliveredAt: Date,
  failedAt: Date,
  retryCount: { type: Number, default: 0, min: 0 },
  lastAttemptAt: Date,
  metadata: { type: Schema.Types.Mixed },
  idempotencyKey: { type: String, index: true, sparse: true },
  isTest: { type: Boolean, default: false, index: true },
}, { timestamps: true });

communicationLogSchema.index({ createdAt: -1 });
communicationLogSchema.index({ clientId: 1, createdAt: -1 });
communicationLogSchema.index({ bookingId: 1, channel: 1, status: 1 });
communicationLogSchema.index({ idempotencyKey: 1, status: 1 });

export default mongoose.model<ICommunicationLog>('CommunicationLog', communicationLogSchema);
