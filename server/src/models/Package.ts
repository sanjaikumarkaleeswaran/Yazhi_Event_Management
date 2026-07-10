import mongoose, { Schema, Document } from 'mongoose';

export enum PackageTier {
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
}

export interface IPackage extends Document {
  title: string;
  eventType: string;
  tier: PackageTier;
  startingPrice: number;
  features: string[];
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema: Schema<IPackage> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Package title is required'],
      trim: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      index: true,
    },
    tier: {
      type: String,
      enum: Object.values(PackageTier),
      required: [true, 'Package tier is required'],
    },
    startingPrice: {
      type: Number,
      required: [true, 'Starting price is required'],
      min: [0, 'Price cannot be negative'],
    },
    features: [
      {
        type: String,
        required: [true, 'Feature description is required'],
      },
    ],
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate tiers for the same event type
packageSchema.index({ eventType: 1, tier: 1 }, { unique: true });

export default mongoose.model<IPackage>('Package', packageSchema);
