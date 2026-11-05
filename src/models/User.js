const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  username: { type: String, required: [true, 'El username es obligatorio'],
              unique: true, trim: true, minlength: 3, maxlength: 20 },
  email:    { type: String, required: true, unique: true, lowercase: true,
              match: [/^\S+@\S+\.\S+$/, 'Email inválido'] },
  avatarUrl: { type: String, default: '' },
  status:   { type: String, enum: ['online', 'offline', 'away'], default: 'offline' }
}, { timestamps: true });

module.exports = model('User', userSchema);
