// PARTE 1. Sustituye cada stub por su implementación (ver docs/enunciado.md).
const pendiente = (req, res) =>
  res.status(501).json({ ok: false, error: { code: 'NOT_IMPLEMENTED', message: 'Endpoint pendiente de implementar' } });

exports.createRoom = pendiente; // #5 POST /rooms
exports.listRooms = pendiente;  // #6 GET /rooms
exports.getRoom = pendiente;    // #7 GET /rooms/:id
exports.joinRoom = pendiente;   // #8 POST /rooms/:id/join
exports.leaveRoom = pendiente;  // #9 POST /rooms/:id/leave (opcional)
exports.deleteRoom = pendiente; // #10 DELETE /rooms/:id (opcional)
