import mongoose, { Document, Schema } from 'mongoose';
import type { CommunicationChannel } from './CommunicationLog';

export type TemplateStatus = 'active' | 'inactive';

export interface IMessageTemplate extends Document {
  name: string;
  key: string;
  channel: Exclude<CommunicationChannel, 'in_app'>;
  subject?: string;
  content: string;
  plainText?: string;
  variables: string[];
  status: TemplateStatus;
  description?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageTemplateSchema = new Schema<IMessageTemplate>({
  name: { type: String, required: true, trim: true, maxlength: 160 },
  key: { type: String, required: true, trim: true, uppercase: true, index: true },
  channel: { type: String, enum: ['email', 'whatsapp', 'sms'], required: true, index: true },
  subject: { type: String, trim: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 100000 },
  plainText: { type: String, maxlength: 10000 },
  variables: { type: [String], default: [] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  description: { type: String, maxlength: 500 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

messageTemplateSchema.index({ key: 1, channel: 1 }, { unique: true });

export default mongoose.model<IMessageTemplate>('MessageTemplate', messageTemplateSchema);
