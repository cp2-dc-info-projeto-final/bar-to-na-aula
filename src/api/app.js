require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bebRouter = require('./routes/beb');
var comRouter = require('./routes/com');
var mesaRouter = require('./routes/mesa');
var showRouter = require('./routes/shows');
var ReservaRouter = require('./routes/reser');



var app = express();

// Origens extras via .env: CORS_ORIGINS=http://192.168.0.10,https://meusite.com
const extraOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
  origin(origin, callback) {
    // sem Origin (curl, Postman, mesma origem) -> libera
    if (!origin) return callback(null, true);
    if (localhostRegex.test(origin) || extraOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn('CORS bloqueado para a origem:', origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/beb', bebRouter);
app.use('/com', comRouter);
app.use('/mesa', mesaRouter);
app.use('/shows', showRouter);
app.use('/reser', ReservaRouter);

// 404
app.use(function (req, res, next) {
  next(createError(404, 'Rota não encontrada'));
});

// Handler de erros (sempre { success, message, errors })
app.use(function (err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'JSON inválido', errors: [] });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  return res.status(status).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    errors: [],
  });
});

module.exports = app;