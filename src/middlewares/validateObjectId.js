const { isValidObjectId } = require('mongoose');

module.exports = (req, res, next) =>
  isValidObjectId(req.params.id)
    ? next()
    : res.status(400).json({ ok: false, error: { code: 'INVALID_ID', message: 'ID inválido' } });
