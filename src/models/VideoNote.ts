import mongoose from 'mongoose';

const VideoNoteSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lectureId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Number, required: true }, // in seconds
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const VideoNote = mongoose.models.VideoNote || mongoose.model('VideoNote', VideoNoteSchema);

export default VideoNote;
