import mongoose from 'mongoose';

const trafficSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String },
  timestamp: { type: Date, default: Date.now },
  details: { type: Object }
});

export default mongoose.model('Traffic', trafficSchema);
