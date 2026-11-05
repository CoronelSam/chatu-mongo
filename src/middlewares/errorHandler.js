module.exports = (err, req, res, next) => {
  if (err.name === 'ValidationError')
    return res.status(400).json({ ok: false, error: { code: 'VALIDATION', message: err.message } });
  if (err.name === 'CastError')
    return res.status(400).json({ ok: false, error: { code: 'INVALID_ID', message: 'ID inválido' } });
  if (err.type === 'entity.parse.failed')
    return res.status(400).json({ ok: false, error: { code: 'INVALID_JSON', message: 'El cuerpo no es JSON válido' } });
  if (err.code === 11000)
    return res.status(409).json({ ok: false, error: { code: 'DUPLICATE', message: 'Registro duplicado', fields: err.keyValue } });
  console.error(err);
  res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error interno' } });
};
