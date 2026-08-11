import mongoose, { Document, Schema } from 'mongoose';
import type { CommunicationChannel } from './CommunicationLog';

export const AUTOMATION_EVENTS = ['INQUIRY_CREATED', 'HIGH_PRIORITY_INQUIRY', 'BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_UPDATED', 'BOOKING_CANCELLED', 'PAYMENT_RECEIVED', 'PAYMENT_DUE', 'INVOICE_CREATED', 'EVENT_UPCOMING', 'DOCUMENT_UPLOADED', 'TEAM_ASSIGNED', 'VENDOR_ASSIGNED', 'EVENT_COMPLETED'] as const;
export type AutomationEvent = typeof AUTOMATION_EVENTS[number];

export interface IAutomationRule extends Document {
  name: string;
  event: AutomationEvent;
  channels: Exclude<CommunicationChannel, 'in_app'>[];
  templateMapping: Map<string, mongoose.Types.ObjectId>;
  enabled: boolean;
  conditions?: Record<string, unknown>;
  delay: number;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const automationRuleSchema = new Schema<IAutomationRule>({
  name: { type: String, required: true, trim: true, maxlength: 160 },
  event: { type: String, enum: AUTOMATION_EVENTS, required: true, index: true },
  channels: { type: [String], enum: ['email', 'whatsapp', 'sms'], default: [] },
  templateMapping: { type: Map, of: { type: Schema.Types.ObjectId, ref: 'MessageTemplate' }, default: {} },
  enabled: { type: Boolean, default: true, index: true },
  conditions: { type: Schema.Types.Mixed, default: {} },
  delay: { type: Number, default: 0, min: 0, max: 2592000 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

automationRuleSchema.index({ event: 1, enabled: 1 });

export default mongoose.model<IAutomationRule>('AutomationRule', automationRuleSchema);
