import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin' | 'superadmin';
  purchasedCourses: mongoose.Types.ObjectId[];
  wishlist: mongoose.Types.ObjectId[];
  viewedCategories: string[];
  createdAt: Date;
  
  // Profile Setup Fields
  avatar?: string;
  phone?: string;
  headline?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  profileSetupCompleted: boolean;

  // New Auth Fields
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiresAt?: Date;
  verificationAttempts: number;
  isBlocked: boolean;
  
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  
  authProvider: 'email' | 'google';
  googleId?: string;
  lastLoginAt?: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['student', 'admin', 'superadmin'], default: 'student' },
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  viewedCategories: [{ type: String }],
  
  // Profile Setup Fields
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  headline: { type: String, default: '' },
  bio: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  profileSetupCompleted: { type: Boolean, default: false },
  
  // New Auth Fields
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpiresAt: { type: Date },
  verificationAttempts: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  
  resetPasswordToken: { type: String },
  resetPasswordExpiresAt: { type: Date },
  
  authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
  googleId: { type: String, sparse: true, unique: true },
  lastLoginAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
});

// Delete the model from the cache to avoid Next.js HMR schema issues
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model<IUser>('User', UserSchema);
