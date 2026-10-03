import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin';
  purchasedCourses: mongoose.Types.ObjectId[];
  createdAt: Date;
  
  // Profile Setup Fields
  avatar?: string;
  phone?: string;
  headline?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  profileSetupCompleted: boolean;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  
  // Profile Setup Fields
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  headline: { type: String, default: '' },
  bio: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  profileSetupCompleted: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
