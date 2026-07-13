import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IPermissionActions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  approve: boolean;
  assign: boolean;
}

export interface ILoginHistory {
  timestamp: Date;
  success: boolean;
  ipAddress: string;
  device: string;
  browser: string;
  location: string;
}

export interface IActivityTimeline {
  action: string;
  description: string;
  date: Date;
  ipAddress?: string;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  name: string; // for backward compatibility
  email: string;
  phone?: string;
  password?: string;
  photo?: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Coordinator' | 'Employee' | 'Vendor' | 'Client';
  permissions: Map<string, IPermissionActions>;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin?: Date;
  lastActive?: Date;
  loginHistory: ILoginHistory[];
  failedAttempts: number;
  isLocked: boolean;
  lockUntil?: Date;
  passwordChangedAt?: Date;
  twoFactorEnabled: boolean;
  refreshTokens: string[];
  activityTimeline: IActivityTimeline[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First Name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is required'],
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    photo: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['Super Admin', 'Admin', 'Manager', 'Coordinator', 'Employee', 'Vendor', 'Client'],
      default: 'Client',
    },
    permissions: {
      type: Map,
      of: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        assign: { type: Boolean, default: false },
      },
      default: {},
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
    lastLogin: Date,
    lastActive: Date,
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        success: Boolean,
        ipAddress: String,
        device: String,
        browser: String,
        location: String,
      },
    ],
    failedAttempts: {
      type: Number,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockUntil: Date,
    passwordChangedAt: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
    activityTimeline: [
      {
        action: String,
        description: String,
        date: { type: Date, default: Date.now },
        ipAddress: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>('save', async function () {
  // Update name field
  this.name = `${this.firstName} ${this.lastName}`.trim();

  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
  this.passwordChangedAt = new Date();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password || '');
};

export default mongoose.model<IUser>('User', userSchema);
