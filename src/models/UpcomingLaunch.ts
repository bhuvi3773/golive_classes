import mongoose from 'mongoose';

const UpcomingLaunchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  launchDate: { type: Date, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['course', 'live-session', 'webinar', 'announcement'], default: 'live-session' },
  status: { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
  instructorName: { type: String, default: 'Expert Instructor' },
  thumbnail: { type: String, default: '' },
  link: { type: String, default: '' }, // e.g. zoom link or course link
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UpcomingLaunch = mongoose.models.UpcomingLaunch || mongoose.model('UpcomingLaunch', UpcomingLaunchSchema);

export default UpcomingLaunch;
