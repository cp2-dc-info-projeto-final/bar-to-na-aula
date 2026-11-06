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

/* GET - Buscar todos os shows (filtro por artista via ?nome=) */
router.get('/', verifyToken, async function(req, res) {
  try {
    const filtro = `%${req.query.nome || ''}%`;
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
router.get('/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;
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
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { artista, horario, genero } = req.body;

    if (!artista || !horario || !genero) {
      const errors = [];
      if (!artista) errors.push({ field: 'artista', message: 'Artista é obrigatório', code: 'REQUIRED' });
      if (!horario) errors.push({ field: 'horario', message: 'Horário é obrigatório', code: 'REQUIRED' });
      if (!genero) errors.push({ field: 'genero', message: 'Gênero é obrigatório', code: 'REQUIRED' });
      return sendError(res, 400, 'Artista, horário e gênero são obrigatórios', errors);
    }

    // Mesmo artista no mesmo horário
    const existing = await pool.query(
      'SELECT id FROM shows WHERE artista = $1 AND horario = $2',
      [artista, horario]
    );
    if (existing.rows.length > 0) {
      return sendError(res, 409, 'Este show já está cadastrado', [
        { field: 'artista', message: 'Este artista já tem show neste horário', code: 'CONFLICT' }
      ]);
    }

    const result = await pool.query(
      'INSERT INTO shows (artista, horario, genero) VALUES ($1, $2, $3) RETURNING id, artista, horario, genero',
      [artista, horario, genero]
    );
    return sendSuccess(res, 201, 'Show criado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar show:', error);
    if (error.code === '22007' || error.code === '22008') {
      return sendError(res, 400, 'Horário inválido.', [
        { field: 'horario', message: 'Horário inválido', code: 'INVALID' }
      ]);
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* PUT - Atualizar show */
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { artista, horario, genero } = req.body;

    if (!artista || !horario || !genero) {
      const errors = [];
      if (!artista) errors.push({ field: 'artista', message: 'Artista é obrigatório', code: 'REQUIRED' });
      if (!horario) errors.push({ field: 'horario', message: 'Horário é obrigatório', code: 'REQUIRED' });
      if (!genero) errors.push({ field: 'genero', message: 'Gênero é obrigatório', code: 'REQUIRED' });
      return sendError(res, 400, 'Artista, horário e gênero são obrigatórios', errors);
    }

    const showExists = await pool.query('SELECT id FROM shows WHERE id = $1', [id]);
    if (showExists.rows.length === 0) {
      return sendError(res, 404, 'Show não encontrado');
    }

    const existing = await pool.query(
      'SELECT id FROM shows WHERE artista = $1 AND horario = $2 AND id != $3',
      [artista, horario, id]
    );
    if (existing.rows.length > 0) {
      return sendError(res, 409, 'Já existe outro show igual', [
        { field: 'artista', message: 'Este artista já tem show neste horário', code: 'CONFLICT' }
      ]);
    }

    const result = await pool.query(
      `UPDATE shows SET artista = $1, horario = $2, genero = $3
       WHERE id = $4
       RETURNING id, artista, horario, genero`,
      [artista, horario, genero, id]
    );
    return sendSuccess(res, 200, 'Show atualizado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar show:', error);
    if (error.code === '22007' || error.code === '22008') {
      return sendError(res, 400, 'Horário inválido.', [
        { field: 'horario', message: 'Horário inválido', code: 'INVALID' }
      ]);
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* DELETE - Remover show */
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;

    const showExists = await pool.query('SELECT id FROM shows WHERE id = $1', [id]);
    if (showExists.rows.length === 0) {
      return sendError(res, 404, 'Show não encontrado');
    }

    await pool.query('DELETE FROM shows WHERE id = $1', [id]);
    return sendSuccess(res, 200, 'Show deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar show:', error);
    // 23503 = chave estrangeira: show ainda está vinculado a uma mesa
    if (error.code === '23503') {
      return sendError(res, 409, 'Este show está vinculado a uma mesa. Troque a mesa para "sem show" antes de excluir.');
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

module.exports = router;