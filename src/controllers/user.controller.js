const User = require('../models/User');

const STATUSES = User.schema.path('status').enumValues;

const fail = (res, status, code, message) =>
  res.status(status).json({ ok: false, error: { code, message } });

// #1 POST /users
exports.createUser = async (req, res, next) => {
  try {
    const { username, email, avatarUrl, status } = req.body ?? {};
    const user = await User.create({ username, email, avatarUrl, status });
    res.status(201).json({ ok: true, data: user });
  } catch (err) { next(err); }
};

// #2 GET /users?status=online
exports.listUsers = async (req, res, next) => {
  try {
    const { status } = req.query;
    if (status !== undefined && !STATUSES.includes(status))
      return fail(res, 400, 'VALIDATION', `status debe ser uno de: ${STATUSES.join(', ')}`);

    const filter = status === undefined ? {} : { status };
    const users = await User.find(filter).sort({ username: 1 });
    res.json({ ok: true, data: users });
  } catch (err) { next(err); }
};

// #3 GET /users/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return fail(res, 404, 'USER_NOT_FOUND', 'Usuario no existe');
    res.json({ ok: true, data: user });
  } catch (err) { next(err); }
};

// #4 PATCH /users/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body ?? {};
    // El enum de Mongoose deja pasar null y undefined, y guardarlos borraría el campo.
    if (status == null) return fail(res, 400, 'VALIDATION', 'El status es obligatorio');

    const user = await User.findById(req.params.id);
    if (!user) return fail(res, 404, 'USER_NOT_FOUND', 'Usuario no existe');

    user.status = status;
    await user.save();
    res.json({ ok: true, data: user });
  } catch (err) { next(err); }
};
