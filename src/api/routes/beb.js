var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middlewares/auth');

function sendSuccess(res, status, message, data) {
  const payload = { success: true };
  if (message) payload.message = message;
  if (typeof data !== 'undefined') payload.data = data;
  return res.status(status).json(payload);
}

function sendError(res, status, message, errors = []) {
return res.status(status).json({
    success: false,
    message,
    errors
  });
}

 //Busca
router.get('/', verifyToken, isAdmin, async function(req, res) {
  try {
    const filtro = req.query.nome ? `%${req.query.nome}%` : "%";
    console.log("filtro: ", filtro);
    const result = await pool.query('SELECT id, nome, marca, tamanho, preço, tipo FROM usuario WHERE nome like $1 ORDER BY id', [filtro]);
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

router.get('/me', verifyToken, async function(req, res) {
  try {
    // parâmetro obtido do token pelo middleware
    const id = req.user.id;
    const result = await pool.query('SELECT id, nome, tipo FROM usuario WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Produto não encontrado');
    }

    return sendSuccess(res, 200, null, result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar preoduto:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

//Criar Produto

router.post('/', async function(req, res) {
  try {
    const { nome, marca, tamanho, preço, tipo = 'alcolico' } = req.body;
    // Validação básica
    if (!nome || !marca || !tamanho || !preço ) {
      const errors = [];
      if (!nome) errors.push({ field: 'nome', message: 'nome é obrigatório', code: 'REQUIRED' });
      if (!marca) errors.push({ field: 'marca', message: 'marca é obrigatório', code: 'REQUIRED' });
      if (!preço) errors.push({ field: 'preço', message: 'preço é obrigatória', code: 'REQUIRED' });

      return sendError(res, 400, 'Login, email e senha são obrigatórios', errors); 
    }
    
    // Verificar se o login já existe
    const existingUser = await pool.query('SELECT id FROM bebida WHERE nome = $1', [nome]);
    if (existingUser.rows.length > 0) {
      return sendError(res, 409, 'nome já está em uso', [
        { field: 'nome', message: 'nome já está em uso', code: 'CONFLICT' }
      ]);
    }

    // Verificar se o email já existe
    const existingEmail = await pool.query('SELECT id FROM bebida WHERE marca = $1', [email]);
    if (existingMarca.rows.length > 0) {
      return sendError(res, 409, 'Email já está em uso', [
        { field: 'marca', message: 'Email já está em uso', code: 'CONFLICT' }
      ]);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 12);
    console.log("chegou 1");
    const result = await pool.query(
      'INSERT INTO usuario (login, email,     senha, role) VALUES ($1, $2, $3, $4) RETURNING id, login, email, role',
      [login, email, hashedPassword, role]
    );
    console.log('\n\n' + role +'\n\n');
    console.log("chegou 2");
    return sendSuccess(res, 201, 'Usuário criado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    // Verificar se é erro de constraint
    if (error.code === '23514') {
      return sendError(res, 400, 'Dados inválidos. Verifique os campos e tente novamente.');
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

module.exports = router;