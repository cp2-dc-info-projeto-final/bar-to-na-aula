var express = require('express');
var router = express.Router();
var db = require('../db'); // ajuste para o seu acesso ao banco

const ok = (res, data, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data, errors: [] });

const fail = (res, status, message, errors = []) =>
  res.status(status).json({ success: false, message, data: null, errors });

function validate(body) {
  const errors = [];
  const artista = (body.artista ?? '').toString().trim();
  const genero = (body.genero ?? '').toString().trim();
  const horario = (body.horario ?? '').toString().trim();

  if (!artista) errors.push({ field: 'artista', message: 'Informe o artista.' });
  if (!genero) errors.push({ field: 'genero', message: 'Informe o gênero.' });
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(horario))
    errors.push({ field: 'horario', message: 'Horário inválido (use HH:MM).' });

  const time = horario.length === 5 ? `${horario}:00` : horario;
  return { errors, values: { artista, genero, horario: time } };
}

// GET /shows?nome=
router.get('/', async (req, res, next) => {
  try {
    const nome = (req.query.nome ?? '').toString();
    const [rows] = await db.query(
      'SELECT id, artista, horario, genero FROM shows WHERE artista LIKE ? ORDER BY horario',
      [`%${nome}%`]
    );
    ok(res, rows);
  } catch (e) { next(e); }
});

// GET /shows/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, artista, horario, genero FROM shows WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return fail(res, 404, 'Show não encontrado.');
    ok(res, rows[0]);
  } catch (e) { next(e); }
});

// POST /shows
router.post('/', async (req, res, next) => {
  try {
    const { errors, values } = validate(req.body);
    if (errors.length) return fail(res, 400, 'Dados inválidos.', errors);

    const [result] = await db.query(
      'INSERT INTO shows (artista, horario, genero) VALUES (?, ?, ?)',
      [values.artista, values.horario, values.genero]
    );
    ok(res, { id: result.insertId, ...values }, 'Show cadastrado.', 201);
  } catch (e) { next(e); }
});

// PUT /shows/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { errors, values } = validate(req.body);
    if (errors.length) return fail(res, 400, 'Dados inválidos.', errors);

    const [result] = await db.query(
      'UPDATE shows SET artista = ?, horario = ?, genero = ? WHERE id = ?',
      [values.artista, values.horario, values.genero, req.params.id]
    );
    if (!result.affectedRows) return fail(res, 404, 'Show não encontrado.');
    ok(res, { id: Number(req.params.id), ...values }, 'Show atualizado.');
  } catch (e) { next(e); }
});

// DELETE /shows/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM shows WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return fail(res, 404, 'Show não encontrado.');
    ok(res, null, 'Show removido.');
  } catch (e) { next(e); }
});

module.exports = router;