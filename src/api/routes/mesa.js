var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const { verifyToken, isAdmin } = require('../middlewares/auth');

const sendSuccess = (res, status, message, data) => {
  const payload = { success: true };
  if (message) payload.message = message;
  if (typeof data !== 'undefined') payload.data = data;
  return res.status(status).json(payload);
};
const sendError = (res, status, message, errors = []) =>
  res.status(status).json({ success: false, message, errors });

const SELECT_MESA = `
  SELECT m.id, m.identificacao, m.tipo, m.id_show,
         s.artista, s.horario, s.genero
  FROM mesa m
  LEFT JOIN shows s ON s.id = m.id_show`;

function validarMesa({ identificacao, tipo, id_show }) {
  const errors = [];
  if (!identificacao) errors.push({ field: 'identificacao', message: 'identificacao é obrigatória', code: 'REQUIRED' });
  if (!['com_show', 'sem_show'].includes(tipo))
    errors.push({ field: 'tipo', message: "tipo deve ser 'com_show' ou 'sem_show'", code: 'INVALID' });
  if (tipo === 'com_show' && !id_show)
    errors.push({ field: 'id_show', message: 'Escolha um show para mesa com show', code: 'REQUIRED' });
  return errors;
}



// Listar (opcional: ?tipo=com_show)
router.get('/',  async (req, res) => {
  try {
    console.log("1");
    const { tipo } = req.query;
    console.log("2");
    const result = tipo
      ? await pool.query(`${SELECT_MESA} WHERE m.tipo = $1 ORDER BY m.identificacao`, [tipo])
      : await pool.query(`${SELECT_MESA} ORDER BY m.identificacao`);
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
        console.error('Erro ao listar mesas:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`${SELECT_MESA} From mesa WHERE m.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return sendError(res, 404, 'mesa não encontrada');
    return sendSuccess(res, 200, null, result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar mesa:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { identificacao, tipo } = req.body;
    const errors = validarMesa(req.body);
    if (errors.length) return sendError(res, 400, 'Dados inválidos', errors);
    const id_show = tipo === 'com_show' ? req.body.id_show : null;

    const result = await pool.query(
      `INSERT INTO mesa (identificacao, tipo, id_show)
       VALUES ($1, $2, $3) RETURNING id, identificacao, tipo, id_show`,
      [identificacao, tipo, id_show]
    );
    return sendSuccess(res, 201, 'mesa criada com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar mesa:', error);
    if (error.code === '23505') return sendError(res, 409, 'Já existe uma mesa com essa identificação');
    if (error.code === '23503') return sendError(res, 400, 'Show informado não existe');
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { identificacao, tipo } = req.body;
    const errors = validarMesa(req.body);
    if (errors.length) return sendError(res, 400, 'Dados inválidos', errors);
    const id_show = tipo === 'com_show' ? req.body.id_show : null;

    const result = await pool.query(
      `UPDATE mesa SET identificacao = $1, tipo = $2, id_show = $3
       WHERE id = $4 RETURNING id, identificacao, tipo, id_show`,
      [identificacao, tipo, id_show, req.params.id]
    );
    if (result.rows.length === 0) return sendError(res, 404, 'mesa não encontrada');
    return sendSuccess(res, 200, 'mesa atualizada com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar mesa:', error);
    if (error.code === '23505') return sendError(res, 409, 'Já existe uma mesa com essa identificação');
    if (error.code === '23503') return sendError(res, 400, 'Show informado não existe');
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM mesa WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return sendError(res, 404, 'mesa não encontrada');
    return sendSuccess(res, 200, 'mesa excluída com sucesso');
  } catch (error) {
    console.error('Erro ao excluir mesa:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

module.exports = router;