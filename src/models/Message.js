const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
  room:    { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  sender:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
  edited:  { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ room: 1, createdAt: -1 });

module.exports = model('Message', messageSchema);
