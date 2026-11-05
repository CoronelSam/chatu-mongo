const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/v1/health', (req, res) => res.json({ ok: true, data: 'ChatU API activa' }));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/rooms', require('./routes/room.routes'));
app.use('/api/v1/messages', require('./routes/message.routes'));

app.use((req, res) => res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } }));
app.use(errorHandler);

module.exports = app;
