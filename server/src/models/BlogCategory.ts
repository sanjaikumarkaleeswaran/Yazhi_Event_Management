import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const blogCategorySchema: Schema<IBlogCategory> = new Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, index: true },
    slug: { type: String, required: [true, 'Slug is required'], unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    color: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

blogCategorySchema.index({ order: 1 });

export default mongoose.model<IBlogCategory>('BlogCategory', blogCategorySchema);
