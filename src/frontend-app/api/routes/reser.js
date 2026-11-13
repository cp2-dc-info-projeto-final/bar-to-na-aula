var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const { verifyToken } = require('../middlewares/auth');

function sendSuccess(res, status, message, data) {
  const payload = { success: true };
  if (message) payload.message = message;
  if (typeof data !== 'undefined') payload.data = data;
  return res.status(status).json(payload);
}

function sendError(res, status, message, errors = []) {
  return res.status(status).json({ success: false, message, errors });
}

// Horários disponíveis (o front usa a mesma lista)
const HORARIOS = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
const TZ = 'America/Sao_Paulo';

const hojeBR = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
const agoraBR = () =>
  new Date().toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }); // HH:MM

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// ⚠ Depende do que o seu verifyToken coloca em req (ver aviso no final da resposta)
function usuarioLogado(req) {
  const u = req.user || req.usuario || {};
  return { id: u.id ?? u.id_usuario ?? null, admin: u.role === 'admin' };
}

function dataValida(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const d = new Date(`${data}T00:00:00Z`);
  return !isNaN(d) && d.toISOString().slice(0, 10) === data;
}

function validarReserva(body = {}) {
  const errors = [];
  const id_mesa = parseId(body.id_mesa);
  const data = String(body.data ?? '').trim();
  const horario = String(body.horario ?? '').trim().slice(0, 5);
  const quantidade = Number(body.quantidade_pessoas);

  if (!id_mesa) {
    errors.push({ field: 'id_mesa', message: 'Escolha uma mesa', code: 'REQUIRED' });
  }
  if (!dataValida(data)) {
    errors.push({ field: 'data', message: 'Data inválida', code: 'INVALID' });
  } else if (data < hojeBR()) {
    errors.push({ field: 'data', message: 'Escolha uma data de hoje em diante', code: 'INVALID' });
  }
  if (!HORARIOS.includes(horario)) {
    errors.push({ field: 'horario', message: 'Horário indisponível', code: 'INVALID' });
  } else if (dataValida(data) && data === hojeBR() && horario <= agoraBR()) {
    errors.push({ field: 'horario', message: 'Esse horário já passou', code: 'INVALID' });
  }
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 12) {
    errors.push({ field: 'quantidade_pessoas', message: 'Informe de 1 a 12 pessoas', code: 'INVALID' });
  }

  return { errors, values: { id_mesa, data, horario, quantidade } };
}

/* GET - Mesas com indicação de ocupada/livre em uma data e horário */
router.get('/disponibilidade', verifyToken, async function (req, res) {
  try {
    const data = String(req.query.data ?? '').trim();
    const horario = String(req.query.horario ?? '').trim().slice(0, 5);
    if (!dataValida(data) || !HORARIOS.includes(horario)) {
      return sendError(res, 400, 'Informe uma data e um horário válidos');
    }

    const result = await pool.query(
      `SELECT m.id, m.identificacao, m.tipo,
              s.artista, to_char(s.horario, 'HH24:MI') AS show_horario,
              EXISTS (
                SELECT 1 FROM reserva r
                WHERE r.id_mesa = m.id AND r.data = $1::date
                  AND r.horario = $2::time AND r.status = 'ativa'
              ) AS reservada
       FROM mesa m
       LEFT JOIN shows s ON s.id = m.id_show
       ORDER BY m.identificacao`,
      [data, horario]
    );
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* GET - Minhas reservas (admin vê todas) */
router.get('/', verifyToken, async function (req, res) {
  try {
    const u = usuarioLogado(req);
    if (!u.id && !u.admin) {
      return sendError(res, 401, 'Não foi possível identificar o usuário logado');
    }

    const params = [];
    let where = '';
    if (!u.admin) {
    params.push(u.id);
    where = 'WHERE r.id_usuario = $1';
    }

    const result = await pool.query(
    `SELECT r.id, r.id_mesa, m.identificacao,
            to_char(r.data, 'YYYY-MM-DD') AS data,
            to_char(r.horario, 'HH24:MI') AS horario,
            r.quantidade_pessoas, r.status,
            u.login, s.artista
    FROM reserva r
    JOIN mesa m ON m.id = r.id_mesa
    JOIN usuario u ON u.id = r.id_usuario
    LEFT JOIN shows s ON s.id = m.id_show
    ${where}
    ORDER BY r.data DESC, r.horario DESC, r.id DESC`,
    params
    );
    return sendSuccess(res, 200, null, result.rows);
} catch (error) {
console.error('Erro ao buscar reservas:', error);
return sendError(res, 500, 'Erro interno do servidor');
}
});

/* POST - Criar reserva */
router.post('/', verifyToken, async function (req, res) {
  try {
    const u = usuarioLogado(req);
    if (!u.id) return sendError(res, 401, 'Não foi possível identificar o usuário logado');

    const { errors, values } = validarReserva(req.body);
    if (errors.length) return sendError(res, 400, 'Verifique os campos informados', errors);

    const mesa = await pool.query('SELECT id FROM mesa WHERE id = $1', [values.id_mesa]);
    if (mesa.rows.length === 0) return sendError(res, 404, 'Mesa não encontrada');

    // O índice único do banco impede reserva duplicada (inclusive em requisições simultâneas)
    const result = await pool.query(
      `INSERT INTO reserva (id_usuario, id_mesa, data, horario, quantidade_pessoas)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, id_mesa, to_char(data, 'YYYY-MM-DD') AS data,
                 to_char(horario, 'HH24:MI') AS horario, quantidade_pessoas, status`,
      [u.id, values.id_mesa, values.data, values.horario, values.quantidade]
    );
    return sendSuccess(res, 201, 'Reserva confirmada', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar reserva:', error.code, error.message, error.detail);
    if (error.code === '23505') {
      return sendError(res, 409, 'Esta mesa já está reservada nesse dia e horário', [
        { field: 'id_mesa', message: 'Mesa já reservada', code: 'CONFLICT' }
      ]);
    }
    if (error.code === '23503') {
      return sendError(res, 400, 'Usuário ou mesa inválidos');
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* DELETE - Cancelar reserva (dono ou admin). Não apaga: marca como cancelada */
router.delete('/:id', verifyToken, async function (req, res) {
  try {
    const u = usuarioLogado(req);
    const id = parseId(req.params.id);
    if (id === null) return sendError(res, 400, 'ID inválido');

    const atual = await pool.query(
      'SELECT id, id_usuario, status FROM reserva WHERE id = $1',
      [id]
    );
    if (atual.rows.length === 0) return sendError(res, 404, 'Reserva não encontrada');

    const reserva = atual.rows[0];
    if (!u.admin && String(reserva.id_usuario) !== String(u.id)) {
      return sendError(res, 403, 'Você não pode cancelar a reserva de outra pessoa');
    }
    if (reserva.status !== 'ativa') {
      return sendError(res, 409, 'Esta reserva já foi cancelada');
    }

    await pool.query("UPDATE reserva SET status = 'cancelada' WHERE id = $1", [id]);
    return sendSuccess(res, 200, 'Reserva cancelada');
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

module.exports = router;