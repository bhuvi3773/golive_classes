import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  thumbnail: string;
  status: 'draft' | 'published';
  createdAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnail: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
