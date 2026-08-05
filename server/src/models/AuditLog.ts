import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  userName: string;
  module: string;
  action: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string;
  browser: string;
  operatingSystem: string;
  createdAt: Date;
}

const auditLogSchema: Schema<IAuditLog> = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    module: { type: String, default: 'Settings' },
    action: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed, default: null },
    newValue: { type: Schema.Types.Mixed, default: null },
    ipAddress: { type: String, default: '' },
    browser: { type: String, default: '' },
    operatingSystem: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
