import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  thumbnail: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  curriculum?: any[]; // Store sections and lectures
  goals?: string[];
  requirements?: string[];
  targetAudience?: string[];
  createdAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnail: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'pending', 'published', 'rejected'], default: 'draft' },
  curriculum: { type: Schema.Types.Mixed, default: [] },
  goals: { type: [String], default: [] },
  requirements: { type: [String], default: [] },
  targetAudience: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

// Delete the model from the cache to avoid Next.js HMR schema issues
if (mongoose.models.Course) {
  delete mongoose.models.Course;
}

export default mongoose.model<ICourse>('Course', CourseSchema);
