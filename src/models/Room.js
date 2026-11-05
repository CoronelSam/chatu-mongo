const { Schema, model } = require('mongoose');

const roomSchema = new Schema({
  name:        { type: String, required: [true, 'El nombre de la sala es obligatorio'],
                 unique: true, trim: true },
  description: { type: String, default: '', trim: true },
  isPrivate:   { type: Boolean, default: false },
  owner:       { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'El owner es obligatorio'] },
  members:     [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// El owner se agrega a members al crear la sala.
roomSchema.pre('validate', function () {
  if (this.isNew && this.owner && !this.members.some((m) => m.equals(this.owner))) {
    this.members.push(this.owner);
  }
});

module.exports = model('Room', roomSchema);
