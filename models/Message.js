const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: { type: String, enum: ['user', 'system'], default: 'user' },
  timestamp: { type: Date, default: Date.now }
});

messageSchema.index({ room: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);

