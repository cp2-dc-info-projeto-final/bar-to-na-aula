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

function validarShow({ artista, horario, genero }) {
  const errors = [];
  if (!artista) errors.push({ field: 'artista', message: 'artista é obrigatório', code: 'REQUIRED' });
  if (!horario) errors.push({ field: 'horario', message: 'horario é obrigatório', code: 'REQUIRED' });
  if (!genero) errors.push({ field: 'genero', message: 'genero é obrigatório', code: 'REQUIRED' });
  return errors;
}

// Listar / buscar por artista
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const filtro = `%${req.query.artista || ''}%`;
    const result = await pool.query(
      'SELECT id, artista, horario, genero FROM shows WHERE artista ILIKE $1 ORDER BY id',
      [filtro]
    );
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar shows:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// Buscar um show
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, artista, horario, genero FROM shows WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return sendError(res, 404, 'show não encontrado');
    return sendSuccess(res, 200, null, result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar show:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// Criar
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { artista, horario, genero } = req.body;
    const errors = validarShow(req.body);
    if (errors.length) return sendError(res, 400, 'Campos obrigatórios', errors);

    const result = await pool.query(
      `INSERT INTO shows (artista, horario, genero)
       VALUES ($1, $2, $3)
       RETURNING id, artista, horario, genero`,
      [artista, horario, genero]
    );
    return sendSuccess(res, 201, 'show marcado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao agendar show:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// Atualizar
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { artista, horario, genero } = req.body;
    const errors = validarShow(req.body);
    if (errors.length) return sendError(res, 400, 'Campos obrigatórios', errors);

    const result = await pool.query(
      `UPDATE shows SET artista = $1, horario = $2, genero = $3
       WHERE id = $4
       RETURNING id, artista, horario, genero`,
      [artista, horario, genero, id]
    );
    if (result.rows.length === 0) return sendError(res, 404, 'show não encontrado');
    return sendSuccess(res, 200, 'show atualizado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar show:', error);
    if (error.code === '23514') return sendError(res, 400, 'Dados inválidos.');
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

// Excluir
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM shows WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return sendError(res, 404, 'show não encontrado');
    return sendSuccess(res, 200, 'show excluído com sucesso');
  } catch (error) {
    console.error('Erro ao excluir show:', error);
    // 23503 = foreign key: o show ainda está em alguma mesa
    if (error.code === '23503') {
      return sendError(res, 409, 'Este show está vinculado a uma mesa. Remova o vínculo antes de excluir.');
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

module.exports = router;