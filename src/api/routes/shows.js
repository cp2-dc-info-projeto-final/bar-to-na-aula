var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const { verifyToken, isAdmin } = require('../middlewares/auth');

function sendSuccess(res, status, message, data) {
  const payload = { success: true };
  if (message) payload.message = message;
  if (typeof data !== 'undefined') payload.data = data;
  return res.status(status).json(payload);
}

function sendError(res, status, message, errors = []) {
  return res.status(status).json({ success: false, message, errors });
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

function validateShow(body = {}) {
  const artista = String(body.artista ?? '').trim();
  const horario = String(body.horario ?? '').trim();
  const genero = String(body.genero ?? '').trim();
  const errors = [];

  if (!artista) errors.push({ field: 'artista', message: 'Artista é obrigatório', code: 'REQUIRED' });
  if (!horario) {
    errors.push({ field: 'horario', message: 'Horário é obrigatório', code: 'REQUIRED' });
  } else if (!TIME_REGEX.test(horario)) {
    errors.push({ field: 'horario', message: 'Horário inválido (use HH:MM)', code: 'INVALID' });
  }
  if (!genero) errors.push({ field: 'genero', message: 'Gênero é obrigatório', code: 'REQUIRED' });

  return { errors, values: { artista, horario, genero } };
}

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const conflictError = () => [
  { field: 'artista', message: 'Este artista já tem show neste horário', code: 'CONFLICT' }
];

// Traduz erros do Postgres (INSERT/UPDATE) para respostas da API
function handleDbError(res, error, contexto, conflictMsg) {
  console.error(contexto, {
    code: error.code,
    message: error.message,
    detail: error.detail,
    constraint: error.constraint
  });

  // Horário inválido para o tipo da coluna
  if (error.code === '22007' || error.code === '22008') {
    return sendError(res, 400, 'Horário inválido.', [
      { field: 'horario', message: 'Horário inválido', code: 'INVALID' }
    ]);
  }

  // Violação de unicidade
  if (error.code === '23505') {
    // Chave primária: sequence do id fora de sincronia (não é show repetido)
    if (error.constraint && error.constraint.endsWith('_pkey')) {
      return sendError(res, 500, 'Falha ao gerar o ID do show. Avise o administrador do banco.');
    }
    return sendError(res, 409, conflictMsg, conflictError());
  }

  // Coluna NOT NULL sem valor
  if (error.code === '23502') {
    return sendError(res, 400, `Campo obrigatório ausente: ${error.column || 'desconhecido'}`);
  }

  return sendError(res, 500, 'Erro interno do servidor');
}

/* GET - Buscar todos os shows (filtro por artista via ?nome=) */
router.get('/', verifyToken, async function (req, res) {
  try {
    const filtro = `%${String(req.query.nome || '').trim()}%`;
    const result = await pool.query(
      'SELECT id, artista, horario, genero FROM shows WHERE artista ILIKE $1 ORDER BY horario, id',
      [filtro]
    );
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar shows:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* GET - Buscar show por ID */
router.get('/:id', verifyToken, async function (req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return sendError(res, 400, 'ID inválido');

    const result = await pool.query(
      'SELECT id, artista, horario, genero FROM shows WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return sendError(res, 404, 'Show não encontrado');
    }
    return sendSuccess(res, 200, null, result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar show:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* POST - Criar novo show */
router.post('/', verifyToken, isAdmin, async function (req, res) {
  try {
    const { errors, values } = validateShow(req.body);
    if (errors.length) {
      return sendError(res, 400, 'Verifique os campos informados', errors);
    }
    const { artista, horario, genero } = values;

    const existing = await pool.query(
      'SELECT id FROM shows WHERE artista = $1 AND horario = $2',
      [artista, horario]
    );
    if (existing.rows.length > 0) {
      return sendError(res, 409, 'Este show já está cadastrado', conflictError());
    }

    const result = await pool.query(
      'INSERT INTO shows (artista, horario, genero) VALUES ($1, $2, $3) RETURNING id, artista, horario, genero',
      [artista, horario, genero]
    );
    return sendSuccess(res, 201, 'Show criado com sucesso', result.rows[0]);
  } catch (error) {
    return handleDbError(res, error, 'Erro ao criar show:', 'Este show já está cadastrado');
  }
});

/* PUT - Atualizar show */
router.put('/:id', verifyToken, isAdmin, async function (req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return sendError(res, 400, 'ID inválido');

    const { errors, values } = validateShow(req.body);
    if (errors.length) {
      return sendError(res, 400, 'Verifique os campos informados', errors);
    }
    const { artista, horario, genero } = values;

    const showExists = await pool.query('SELECT id FROM shows WHERE id = $1', [id]);
    if (showExists.rows.length === 0) {
      return sendError(res, 404, 'Show não encontrado');
    }

    const existing = await pool.query(
      'SELECT id FROM shows WHERE artista = $1 AND horario = $2 AND id != $3',
      [artista, horario, id]
    );
    if (existing.rows.length > 0) {
      return sendError(res, 409, 'Já existe outro show igual', conflictError());
    }

    const result = await pool.query(
      `UPDATE shows SET artista = $1, horario = $2, genero = $3
       WHERE id = $4
       RETURNING id, artista, horario, genero`,
      [artista, horario, genero, id]
    );
    return sendSuccess(res, 200, 'Show atualizado com sucesso', result.rows[0]);
  } catch (error) {
    return handleDbError(res, error, 'Erro ao atualizar show:', 'Já existe outro show igual');
  }
});

/* DELETE - Remover show */
router.delete('/:id', verifyToken, isAdmin, async function (req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return sendError(res, 400, 'ID inválido');

    const result = await pool.query('DELETE FROM shows WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return sendError(res, 404, 'Show não encontrado');
    }
    return sendSuccess(res, 200, 'Show deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar show:', error.code, error.message, error.detail);
    // 23503 = chave estrangeira: show ainda está vinculado a uma mesa
    if (error.code === '23503') {
      return sendError(res, 409, 'Este show está vinculado a uma mesa. Troque a mesa para "sem show" antes de excluir.');
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

module.exports = router;