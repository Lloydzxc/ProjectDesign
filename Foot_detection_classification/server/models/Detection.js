import mongoose from 'mongoose';

const detectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  detections: [{
    class_id: Number,
    class_name: String,
    confidence: Number,
    bbox_xyxy: [Number]
  }],
  detectionCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
detectionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Detection', detectionSchema);