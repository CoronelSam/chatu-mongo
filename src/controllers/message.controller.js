const { isValidObjectId } = require('mongoose');
require('../models/User'); // Registra el modelo usado por populate('sender')
const Message = require('../models/Message');
const Room = require('../models/Room');

const errorResponse = (res, status, code, message) =>
  res.status(status).json({ ok: false, error: { code, message } });

// #11 POST /rooms/:id/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const { senderId, content } = req.body ?? {};

    if (!senderId || !isValidObjectId(senderId)) {
      return errorResponse(res, 400, 'INVALID_ID', 'ID del remitente inválido');
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return errorResponse(res, 404, 'ROOM_NOT_FOUND', 'Sala no existe');
    }

    const isMember = room.members.some((member) => member.equals(senderId));
    if (!isMember) {
      return errorResponse(res, 403, 'NOT_MEMBER', 'El usuario no pertenece a la sala');
    }

    const message = await Message.create({ room: room._id, sender: senderId, content });
    await message.populate('sender', 'username avatarUrl');
    return res.status(201).json({ ok: true, data: message });
  } catch (err) {
    next(err);
  }
};

// #12 GET /rooms/:id/messages?page=1&limit=20
exports.listMessages = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 20, 100));

    const room = await Room.findById(req.params.id);
    if (!room) {
      return errorResponse(res, 404, 'ROOM_NOT_FOUND', 'Sala no existe');
    }

    const filter = { room: room._id };
    const [messages, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('sender', 'username avatarUrl'),
      Message.countDocuments(filter)
    ]);

    return res.json({ ok: true, data: messages, meta: { page, limit, total } });
  } catch (err) {
    next(err);
  }
};

// #13 PUT /messages/:id
exports.updateMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return errorResponse(res, 404, 'MESSAGE_NOT_FOUND', 'Mensaje no existe');
    }

    message.content = (req.body ?? {}).content;
    message.edited = true;
    await message.save();
    await message.populate('sender', 'username avatarUrl');

    return res.status(200).json({ ok: true, data: message });
  } catch (err) {
    next(err);
  }
};

// #14 DELETE /messages/:id
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return errorResponse(res, 404, 'MESSAGE_NOT_FOUND', 'Mensaje no existe');
    }

    return res.status(204).end();
  } catch (err) {
    next(err);
  }
};
