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
    console.error('Erro ao buscar bebidas:', error);
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
      
    if (!nome || !marca || !tamanho || !preço ) {
      const errors = [];
      if (!nome) errors.push({ field: 'nome', message: 'nome é obrigatório', code: 'REQUIRED' });
      if (!marca) errors.push({ field: 'marca', message: 'marca é obrigatório', code: 'REQUIRED' });
      if (!tamanho) errors.push({ field: 'tamanho', message: 'tamanho é obrigatório', code: 'REQUIRED' });
      if (!preço) errors.push({ field: 'preço', message: 'preço é obrigatória', code: 'REQUIRED' });

      return sendError(res, 400, 'campos obrigatórios', errors); 
    }
    
    const existingBeb = await pool.query('SELECT id FROM bebida WHERE nome = $1', [nome]);
    if (existingBeb.rows.length > 0) {
      return sendError(res, 409, 'nome já está em uso', [
        { field: 'nome', message: 'nome já está em uso', code: 'CONFLICT' }
      ]);
    }

    const existingMarca = await pool.query('SELECT id FROM bebida WHERE marca = $1', [marca]);
    if (existingMarca.rows.length > 0) {
      return sendError(res, 409, 'Está marca já está em uso', [
        { field: 'marca', message: 'Está marca já está em uso', code: 'CONFLICT' }
      ]);
    }
    const existingTamanho = await pool.query('SELECT id FROM bebida WHERE tamanho = $1', [tamanho]);
    if (existingTamanho.rows.length > 0) {
      return sendError(res, 409, 'Este tamanho procede', [
        { field: 'tamanho', message: 'Este tamanho procede', code: 'CONFLICT' }
      ]);
    }
    
  }
  catch (error) {
    console.error('Erro ao criar bebida:', error);
    return sendError(res, 500, 'Erro interno do servidor')
  }
});

// // Tentativa de cadastro de bebida
// router.post('/cadastro' (req,res)); {
//   const{ nome , preço} = req.body;
//   if (!nome || !preço){
//     return res.status(400).json({ error: " Coloque nome e preço do produto" });

//   }
// };



module.exports = router;