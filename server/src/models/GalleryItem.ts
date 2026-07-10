import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryItem extends Document {
  title?: string;
  imageUrl: string;
  publicId: string;
  eventType: string;
  altText: string;
  tags: string[];
  order: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const galleryItemSchema: Schema<IGalleryItem> = new Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      index: true,
    },
    altText: {
      type: String,
      required: [true, 'Alt text is required for accessibility'],
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGalleryItem>('GalleryItem', galleryItemSchema);
