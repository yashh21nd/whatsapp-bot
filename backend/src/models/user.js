import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String },
  otpExpires: { type: Date },
  subscription: {
    type: {
      type: String,
      enum: ['hour', 'day', 'week'],
      default: null
    },
    expires: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

export default mongoose.model('User', userSchema);
