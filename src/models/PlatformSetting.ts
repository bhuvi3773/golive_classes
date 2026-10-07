import mongoose from 'mongoose';

const PlatformSettingSchema = new mongoose.Schema({
  commissionRate: { type: Number, default: 20 }, // Percentage taken by platform
  allowInstructorRegistration: { type: Boolean, default: true },
  siteName: { type: String, default: "GoLive Classes" },
  contactEmail: { type: String, default: "support@goliveclasses.com" },
  updatedAt: { type: Date, default: Date.now }
});

const PlatformSetting = mongoose.models.PlatformSetting || mongoose.model('PlatformSetting', PlatformSettingSchema);

export default PlatformSetting;
