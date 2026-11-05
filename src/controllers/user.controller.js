// PARTE 1. Sustituye cada stub por su implementación (ver docs/enunciado.md).
const pendiente = (req, res) =>
  res.status(501).json({ ok: false, error: { code: 'NOT_IMPLEMENTED', message: 'Endpoint pendiente de implementar' } });

exports.createUser = pendiente;   // #1 POST /users
exports.listUsers = pendiente;    // #2 GET /users?status=online
exports.getUser = pendiente;      // #3 GET /users/:id
exports.updateStatus = pendiente; // #4 PATCH /users/:id/status (opcional)
