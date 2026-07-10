import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  clientName: string;
  eventType: string;
  message: string;
  rating: number;
  imageUrl?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema: Schema<ITestimonial> = new Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Testimonial message is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      default: 5,
    },
    imageUrl: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch approved testimonials sorted by date
testimonialSchema.index({ isApproved: 1, createdAt: -1 });

export default mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
