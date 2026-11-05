// PARTE 2. Sustituye cada stub por su implementación (ver AGENTS.md).
const pendiente = (req, res) =>
  res.status(501).json({ ok: false, error: { code: 'NOT_IMPLEMENTED', message: 'Endpoint pendiente de implementar' } });

exports.sendMessage = pendiente;   // #11 POST /rooms/:id/messages
exports.listMessages = pendiente;  // #12 GET /rooms/:id/messages?page=1&limit=20
exports.updateMessage = pendiente; // #13 PUT /messages/:id
exports.deleteMessage = pendiente; // #14 DELETE /messages/:id
