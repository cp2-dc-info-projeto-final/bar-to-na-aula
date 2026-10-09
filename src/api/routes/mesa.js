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

const SELECT_MESA = `
  SELECT m.id, m.identificacao, m.tipo, m.id_show,
         s.artista, s.horario, s.genero
  FROM mesa m
  LEFT JOIN shows s ON s.id = m.id_show`;

function validarMesa({ identificacao, tipo, id_show }) {
  const errors = [];
  if (!identificacao) errors.push({ field: 'identificacao', message: 'Identificação é obrigatória', code: 'REQUIRED' });
  if (!['com_show', 'sem_show'].includes(tipo)) {
    errors.push({ field: 'tipo', message: "Tipo deve ser 'com_show' ou 'sem_show'", code: 'INVALID' });
  }
  if (tipo === 'com_show' && !id_show) {
    errors.push({ field: 'id_show', message: 'Escolha um show para mesa com show', code: 'REQUIRED' });
  }
  return errors;
}

/* GET - Buscar mesas (?nome= busca por número ou artista, ?tipo= filtra o tipo) */
router.get('/', verifyToken, async function(req, res) {
  try {
    const { nome, tipo } = req.query;
    const conditions = [];
    const params = [];

    if (nome) {
      params.push(`%${nome}%`);
      conditions.push(`(m.identificacao::text ILIKE $${params.length} OR s.artista ILIKE $${params.length})`);
    }
    if (tipo) {
      params.push(tipo);
      conditions.push(`m.tipo = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`${SELECT_MESA} ${where} ORDER BY m.identificacao`, params);
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar mesas:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* GET - Buscar mesa por ID */
router.get('/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(`${SELECT_MESA} WHERE m.id = $1`, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 404, 'Mesa não encontrada');
    }
    return sendSuccess(res, 200, null, result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar mesa:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* POST - Criar mesa */
router.post('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const { identificacao, tipo } = req.body;
    const errors = validarMesa(req.body);
    if (errors.length) return sendError(res, 400, 'Dados inválidos', errors);

    // Sem show nunca guarda id_show
    const id_show = tipo === 'com_show' ? req.body.id_show : null;

    const existing = await pool.query('SELECT id FROM mesa WHERE identificacao = $1', [identificacao]);
    if (existing.rows.length > 0) {
      return sendError(res, 409, 'Identificação já está em uso', [
        { field: 'identificacao', message: 'Já existe uma mesa com essa identificação', code: 'CONFLICT' }
      ]);
    }

    if (id_show) {
      const showExists = await pool.query('SELECT id FROM shows WHERE id = $1', [id_show]);
      if (showExists.rows.length === 0) {
        return sendError(res, 400, 'Show informado não existe', [
          { field: 'id_show', message: 'Show não encontrado', code: 'INVALID' }
        ]);
      }
    }

    const result = await pool.query(
      `INSERT INTO mesa (identificacao, tipo, id_show)
       VALUES ($1, $2, $3)
       RETURNING id, identificacao, tipo, id_show`,
      [identificacao, tipo, id_show]
    );
    return sendSuccess(res, 201, 'Mesa criada com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar mesa:', error);
    if (error.code === '23514') {
      return sendError(res, 400, 'Dados inválidos. Verifique os campos e tente novamente.');
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* PUT - Atualizar mesa */
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { identificacao, tipo } = req.body;
    const errors = validarMesa(req.body);
    if (errors.length) return sendError(res, 400, 'Dados inválidos', errors);

    const id_show = tipo === 'com_show' ? req.body.id_show : null;

    const mesaExists = await pool.query('SELECT id FROM mesa WHERE id = $1', [id]);
    if (mesaExists.rows.length === 0) {
      return sendError(res, 404, 'Mesa não encontrada');
    }

    const existing = await pool.query(
      'SELECT id FROM mesa WHERE identificacao = $1 AND id != $2',
      [identificacao, id]
    );
    if (existing.rows.length > 0) {
      return sendError(res, 409, 'Identificação já está em uso por outra mesa', [
        { field: 'identificacao', message: 'Já existe uma mesa com essa identificação', code: 'CONFLICT' }
      ]);
    }

    if (id_show) {
      const showExists = await pool.query('SELECT id FROM shows WHERE id = $1', [id_show]);
      if (showExists.rows.length === 0) {
        return sendError(res, 400, 'Show informado não existe', [
          { field: 'id_show', message: 'Show não encontrado', code: 'INVALID' }
        ]);
      }
    }

    const result = await pool.query(
      `UPDATE mesa SET identificacao = $1, tipo = $2, id_show = $3
       WHERE id = $4
       RETURNING id, identificacao, tipo, id_show`,
      [identificacao, tipo, id_show, id]
    );
    return sendSuccess(res, 200, 'Mesa atualizada com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar mesa:', error);
    if (error.code === '23514') {
      return sendError(res, 400, 'Dados inválidos. Verifique os campos e tente novamente.');
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* DELETE - Remover mesa */
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;

    const mesaExists = await pool.query('SELECT id FROM mesa WHERE id = $1', [id]);
    if (mesaExists.rows.length === 0) {
      return sendError(res, 404, 'Mesa não encontrada');
    }

    await pool.query('DELETE FROM mesa WHERE id = $1', [id]);
    return sendSuccess(res, 200, 'Mesa deletada com sucesso');
  } catch (error) {
    console.error('Erro ao deletar mesa:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

module.exports = router;