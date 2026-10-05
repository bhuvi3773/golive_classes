import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  completedLectures: number[]; // Array of lecture IDs
  lastAccessedLecture?: number;
  completedAt?: Date;
  updatedAt: Date;
}

const ProgressSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLectures: { type: [Number], default: [] },
  lastAccessedLecture: { type: Number },
  completedAt: { type: Date },
  updatedAt: { type: Date, default: Date.now },
});

// Create a compound index so a user only has one progress record per course
ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Delete the model from the cache to avoid Next.js HMR schema issues
if (mongoose.models.Progress) {
  delete mongoose.models.Progress;
}

export default mongoose.model<IProgress>('Progress', ProgressSchema);
