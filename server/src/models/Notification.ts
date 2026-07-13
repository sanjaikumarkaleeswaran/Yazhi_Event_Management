import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  recipientType: 'Super Admin' | 'Admin' | 'Manager' | 'Coordinator' | 'Employee' | 'Vendor' | 'Client' | 'All';
  recipientId?: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  module: 'Dashboard' | 'Bookings' | 'Calendar' | 'Inquiries' | 'Clients' | 'Vendors' | 'Team' | 'Payments' | 'Reports' | 'Settings' | 'Blog' | 'Notifications' | 'Users';
  referenceId?: mongoose.Types.ObjectId;
  referenceType?: string;
  isRead: boolean;
  readAt?: Date;
  deliveryStatus: 'Pending' | 'Sent' | 'Failed';
  channels: ('In-App' | 'Email' | 'SMS')[];
  scheduledAt: Date;
  expiresAt?: Date;
  metadata?: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    priority: { 
      type: String, 
      required: true, 
      enum: ['Low', 'Medium', 'High', 'Critical'], 
      default: 'Medium' 
    },
    recipientType: { 
      type: String, 
      required: true, 
      enum: ['Super Admin', 'Admin', 'Manager', 'Coordinator', 'Employee', 'Vendor', 'Client', 'All'] 
    },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    module: { 
      type: String, 
      required: true, 
      enum: [
        'Dashboard', 'Bookings', 'Calendar', 'Inquiries', 'Clients', 
        'Vendors', 'Team', 'Payments', 'Reports', 'Settings', 
        'Blog', 'Notifications', 'Users'
      ] 
    },
    referenceId: { type: Schema.Types.ObjectId },
    referenceType: { type: String },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    deliveryStatus: { 
      type: String, 
      enum: ['Pending', 'Sent', 'Failed'], 
      default: 'Sent' 
    },
    channels: { 
      type: [String], 
      enum: ['In-App', 'Email', 'SMS'], 
      default: ['In-App'] 
    },
    scheduledAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    metadata: { type: Map, of: String }
  },
  {
    timestamps: true
  }
);

// Indexes
NotificationSchema.index({ recipientType: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
