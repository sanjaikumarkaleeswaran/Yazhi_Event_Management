import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMember extends Document {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: string;
  department: string; // 'Operations', 'Sales', 'Design', 'Catering', 'Logistics', 'Marketing'
  designation: string;
  skills: string[];
  experience: number; // in years
  joiningDate: Date;
  salary?: number;
  availabilityStatus: 'Available' | 'Busy' | 'On Leave' | 'Inactive';
  employmentStatus: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  documents: { name: string; url: string; uploadedAt: Date }[];
  assignedBookings: mongoose.Types.ObjectId[];
  workingHours?: number; // per week
  leaveBalance?: number; // days
  notes?: string;
  ratings?: number;
  timeline: { action: string; description: string; date: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema: Schema<ITeamMember> = new Schema(
  {
    employeeId: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    photo: { type: String },
    department: { type: String, required: true, trim: true, index: true },
    designation: { type: String, required: true, trim: true },
    skills: [{ type: String }],
    experience: { type: Number, default: 0 },
    joiningDate: { type: Date, required: true },
    salary: { type: Number },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Busy', 'On Leave', 'Inactive'],
      default: 'Available',
      index: true
    },
    employmentStatus: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
      default: 'Full-time'
    },
    address: { type: String },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String }
    },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    assignedBookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
    workingHours: { type: Number, default: 40 },
    leaveBalance: { type: Number, default: 15 },
    notes: { type: String },
    ratings: { type: Number, default: 5 },
    timeline: [
      {
        action: { type: String },
        description: { type: String },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Virtual property for full name
teamMemberSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

teamMemberSchema.set('toJSON', { virtuals: true });
teamMemberSchema.set('toObject', { virtuals: true });

export default mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
