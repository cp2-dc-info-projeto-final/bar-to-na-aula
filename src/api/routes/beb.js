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
    const result = await pool.query('SELECT id, nome, preco, marca, tamanho, tipo FROM bebida WHERE nome like $1 ORDER BY id', [filtro]);
    return sendSuccess(res, 200, null, result.rows);
  } catch (error) {
    console.error('Erro ao buscar bebidas:', error);
    return sendError(res, 500, 'Erro interno do servidor');

  }
});

router.get('/me', verifyToken, isAdmin, async function(req, res) {
  try {
    // parâmetro obtido do token pelo middleware
    const id = req.user.id;
    const result = await pool.query('SELECT id, nome, tipo FROM bebida WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return sendError(res, 404, 'bebida não encontrado');
    }

    return sendSuccess(res, 200, null, result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

//Criar bebida

router.post('/', verifyToken, isAdmin, async function(req, res) { 
  try {
    const { nome, preco, marca, tamanho, tipo } = req.body;

    console.log('DADOS RECEBIDOS:', req.body);

    if (!nome || !preco || !marca || !tamanho || !tipo) {
      const errors = [];

      if (!nome) {
        errors.push({
          field: 'nome',
          message: 'nome é obrigatório',
          code: 'REQUIRED'
        });
      }

      if (!marca) {
        errors.push({
          field: 'marca',
          message: 'marca é obrigatória',
          code: 'REQUIRED'
        });
      }

      if (!tamanho) {
        errors.push({
          field: 'tamanho',
          message: 'tamanho é obrigatório',
          code: 'REQUIRED'
        });
      }

      if (!preco) {
        errors.push({
          field: 'preco',
          message: 'preco é obrigatório',
          code: 'REQUIRED'
        });
      }

      if (!tipo) {
        errors.push({
          field: 'tipo',
          message: 'tipo é obrigatório',
          code: 'REQUIRED'
        });
      }

      return sendError(res, 400, 'Campos obrigatórios', errors);
    }

    const result = await pool.query(
      `INSERT INTO bebida (nome, marca, tamanho, preco, tipo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nome, marca, tamanho, preco, tipo`,
      [nome, marca, tamanho, preco, tipo]
    );

    return sendSuccess(
      res,
      201,
      'Bebida criada com sucesso',
      result.rows[0]
    );

  } catch (error) {
    console.error('Erro ao criar bebida:', error);

    return sendError(
      res,
      500,
      'Erro interno do servidor'
    );
  }
});


  
  /* PUT - Atualizar bebida*/
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { nome, marca, preco, tamanho, tipo } = req.body;
    
    // Validação básica
    if (!nome || !marca || !preco || !tamanho || !tipo) {
      const errors = [];
      if (!nome) errors.push({ field: 'nome', message: 'nome é obrigatório', code: 'REQUIRED' });
      if (!marca) errors.push({ field: 'marca', message: 'marca é obrigatório', code: 'REQUIRED' });
      if (!preco) errors.push({ field: 'preco', message: 'preco é obrigatório', code: 'REQUIRED' });
      if (!tamanho) errors.push({ field: 'tamanho', message: 'tamanho é obrigatório', code: 'REQUIRED' });

      return sendError(res, 400, 'Campos obrigatórios', errors);
    }
    
    // Verificar se já existe nomes de bebidas repetidos
    const existingNome = await pool.query('SELECT id FROM bebida WHERE nome = $1 AND id != $2', [nome, id]);
    if (existingNome.rows.length > 0) {
      return sendError(res, 409, 'Este nome já está em uso por outro usuário', [
        { field: 'nome', message: 'Este nome já está em uso por outro usuário', code: 'CONFLICT' }
      ]);
    }

    // Verificar se a marcas repetidas
    const existingMarca = await pool.query('SELECT id FROM bebida WHERE marca = $1 AND id != $2', [marca, id]);
    if (existingMarca.rows.length > 0) {
      return sendError(res, 409, 'A marca já está em uso por outro usuário', [
        { field: 'marca', message: 'A marca já está em uso por outro usuário', code: 'CONFLICT' }
      ]);
    }

    const result = await pool.query(
      `UPDATE bebida
      SET nome = $1,
          marca = $2,
          tamanho = $3,
          preco = $4,
          tipo = $5
      WHERE id = $6
      RETURNING id, nome, marca, tamanho, preco, tipo`,
      [nome, marca, tamanho, preco, tipo, id]
  );

  if (result.rows.length === 0) {
    return sendError(res, 404, 'Bebida não encontrada');
  }

  
    
    return sendSuccess(res, 200, 'bebida atualizado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar :', error);
    // Verificar se é erro de constraint
    if (error.code === '23514') {
      return sendError(res, 400, 'Dados inválidos. Verifique os campos e tente novamente.');
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
      const { id } = req.params;

      const result = await pool.query(
          'DELETE FROM bebida WHERE id = $1 RETURNING id',
          [id]
      );

      if (result.rows.length === 0) {
          return sendError(res, 404, 'Bebida não encontrada');
      }

      return sendSuccess(
          res,
          200,
          'Bebida excluída com sucesso'
      );

  } catch (error) {
      console.error(error);

      return sendError(
          res,
          500,
          'Erro interno do servidor'
      );
  }
});




module.exports = router;