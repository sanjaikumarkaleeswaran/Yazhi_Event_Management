import mongoose, { Document, Schema } from 'mongoose';

export type ClientDocumentType = 'Contracts' | 'Invoices' | 'Event Documents' | 'Other';

export interface IClientDocument extends Document {
  filename: string;
  url: string;
  publicId: string;
  resourceType: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  documentType: ClientDocumentType;
  createdAt: Date;
  updatedAt: Date;
}

const clientDocumentSchema = new Schema<IClientDocument>({
  filename: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  resourceType: { type: String, required: true },
  size: { type: Number, required: true, min: 0 },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  documentType: { type: String, enum: ['Contracts', 'Invoices', 'Event Documents', 'Other'], default: 'Other' },
}, { timestamps: true });

clientDocumentSchema.index({ clientId: 1, createdAt: -1 });

export default mongoose.model<IClientDocument>('ClientDocument', clientDocumentSchema);