const { isValidObjectId } = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');

const fail = (res, status, code, message) =>
  res.status(status).json({ ok: false, error: { code, message } });

const isMember = (room, userId) => room.members.some((m) => m.equals(userId));

// #5 POST /rooms
exports.createRoom = async (req, res, next) => {
  try {
    const { name, description, isPrivate, ownerId } = req.body ?? {};
    if (!isValidObjectId(ownerId)) return fail(res, 400, 'INVALID_ID', 'ownerId inválido');
    if (!(await User.exists({ _id: ownerId })))
      return fail(res, 404, 'USER_NOT_FOUND', 'Usuario no existe');

    const room = await Room.create({ name, description, isPrivate, owner: ownerId });
    res.status(201).json({ ok: true, data: room });
  } catch (err) { next(err); }
};

// #6 GET /rooms
exports.listRooms = async (req, res, next) => {
  try {
    const rooms = await Room.aggregate([
      { $match: { isPrivate: false } },
      { $addFields: { memberCount: { $size: '$members' } } },
      { $project: { members: 0 } },
      { $sort: { name: 1 } }
    ]);
    res.json({ ok: true, data: rooms });
  } catch (err) { next(err); }
};

// #7 GET /rooms/:id
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('members', 'username avatarUrl status');
    if (!room) return fail(res, 404, 'ROOM_NOT_FOUND', 'Sala no existe');
    res.json({ ok: true, data: room });
  } catch (err) { next(err); }
};

// #8 POST /rooms/:id/join
exports.joinRoom = async (req, res, next) => {
  try {
    const { userId } = req.body ?? {};
    if (!isValidObjectId(userId)) return fail(res, 400, 'INVALID_ID', 'userId inválido');

    const room = await Room.findById(req.params.id);
    if (!room) return fail(res, 404, 'ROOM_NOT_FOUND', 'Sala no existe');
    if (!(await User.exists({ _id: userId })))
      return fail(res, 404, 'USER_NOT_FOUND', 'Usuario no existe');
    if (isMember(room, userId))
      return fail(res, 409, 'ALREADY_MEMBER', 'El usuario ya es miembro de la sala');

    room.members.addToSet(userId);
    await room.save();
    res.json({ ok: true, data: room });
  } catch (err) { next(err); }
};

// #9 POST /rooms/:id/leave
exports.leaveRoom = async (req, res, next) => {
  try {
    const { userId } = req.body ?? {};
    if (!isValidObjectId(userId)) return fail(res, 400, 'INVALID_ID', 'userId inválido');

    const room = await Room.findById(req.params.id);
    if (!room) return fail(res, 404, 'ROOM_NOT_FOUND', 'Sala no existe');
    if (!isMember(room, userId))
      return fail(res, 403, 'NOT_MEMBER', 'El usuario no pertenece a la sala');

    room.members.pull(userId);
    await room.save();
    res.json({ ok: true, data: room });
  } catch (err) { next(err); }
};

// #10 DELETE /rooms/:id (body: userId, para comprobar que es el owner)
exports.deleteRoom = async (req, res, next) => {
  try {
    const { userId } = req.body ?? {};
    if (!isValidObjectId(userId)) return fail(res, 400, 'INVALID_ID', 'userId inválido');

    const room = await Room.findById(req.params.id);
    if (!room) return fail(res, 404, 'ROOM_NOT_FOUND', 'Sala no existe');
    if (!room.owner.equals(userId))
      return fail(res, 403, 'NOT_OWNER', 'Solo el owner puede eliminar la sala');

    // Primero los mensajes: si algo falla a mitad, la sala sigue ahí y se puede reintentar.
    await Message.deleteMany({ room: room._id });
    await room.deleteOne();
    res.status(204).end();
  } catch (err) { next(err); }
};
