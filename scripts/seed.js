// Crea datos de prueba para probar los mensajes sin depender de los endpoints de
// usuarios y salas. Se puede repetir: solo reinicia la sala "seed-sala" y sus mensajes.
// No usa ana ni beto para no chocar con los casos de la colección de Postman.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Room = require('../src/models/Room');
const Message = require('../src/models/Message');

const ROOM_NAME = 'seed-sala';

const findOrCreateUser = async (username) =>
  (await User.findOne({ username })) ??
  User.create({ username, email: `${username}@chatu.test`, status: 'online' });

const main = async () => {
  await connectDB();
  await Promise.all([User.init(), Room.init(), Message.init()]);

  const miembro = await findOrCreateUser('seed_miembro');
  const externo = await findOrCreateUser('seed_externo');

  let room = await Room.findOne({ name: ROOM_NAME });
  if (room) await Message.deleteMany({ room: room._id });
  else room = new Room({ name: ROOM_NAME, description: 'Sala de prueba', owner: miembro._id });
  room.members = [miembro._id];
  await room.save();

  console.log('Datos de prueba listos:');
  console.log(`  roomId    = ${room._id}`);
  console.log(`  miembroId = ${miembro._id}  (puede enviar mensajes)`);
  console.log(`  externoId = ${externo._id}  (no es miembro: debe dar 403)`);

  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
