import mongoose, { Schema, Document } from 'mongoose';

export enum BlogCommentStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface IBlogComment extends Document {
  blogId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  message: string;
  status: BlogCommentStatus;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogCommentSchema: Schema<IBlogComment> = new Schema(
  {
    blogId: { type: Schema.Types.ObjectId, ref: 'BlogPost', required: true, index: true },
    name: { type: String, required: [true, 'Name is required'] },
    email: { type: String, default: '' },
    message: { type: String, required: [true, 'Message is required'] },
    status: { type: String, enum: Object.values(BlogCommentStatus), default: BlogCommentStatus.PENDING, index: true },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

blogCommentSchema.index({ blogId: 1, status: 1, createdAt: -1 });

export default mongoose.model<IBlogComment>('BlogComment', blogCommentSchema);
