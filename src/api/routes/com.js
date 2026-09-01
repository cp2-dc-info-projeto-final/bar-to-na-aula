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
    const result = await pool.query('SELECT id, nome, preco, sabor FROM comida WHERE nome like $1 ORDER BY id', [filtro]);
    return sendSuccess(res, 200, null, result.rows);
} catch (error) {
    console.error('Erro ao buscar a comida:', error);
    return sendError(res, 500, 'Erro interno do servidor');

}
});

router.get('/me', verifyToken, isAdmin, async function(req, res) {
try {
    // parâmetro obtido do token pelo middleware
    const id = req.user.id;
    const result = await pool.query('SELECT id, nome, sabor FROM comida WHERE id = $1', [id]);

    if (result.rows.length === 0) {
    return sendError(res, 404, 'comida não encontrado');
    }

    return sendSuccess(res, 200, null, result.rows[0]);
} catch (error) {
    console.error('Erro ao buscar comida:', error);
    return sendError(res, 500, 'Erro interno do servidor');
}
});

//Criar comida

router.post('/', verifyToken, isAdmin, async function(req, res) { 
try {
    const { nome, preco, sabor } = req.body;

    console.log('DADOS RECEBIDOS:', req.body);

    if (!nome || !preco || !sabor) {
    const errors = [];

    if (!nome) {
        errors.push({
        field: 'nome',
        message: 'nome é obrigatório',
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

    if (!sabor) {
        errors.push({
        field: 'sabor',
        message: 'sabor é obrigatório',
        code: 'REQUIRED'
        });
    }

    return sendError(res, 400, 'Campos obrigatórios', errors);
    }

    const result = await pool.query(
    `INSERT INTO bebida (nome, preco, sabor)
    VALUES ($1, $2, $3,)
    RETURNING id, nome, preco, sabor`,
    [nome, preco, sabor]
    );

    return sendSuccess(
    res,
    201,
    'comida criada com sucesso',
    result.rows[0]
    );

} catch (error) {
    console.error('Erro ao criar comida:', error);

    return sendError(
    res,
    500,
    'Erro interno do servidor'
    );
}
});



/* PUT - Atualizar comida*/
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
try {
    const { id } = req.params;
    const { nome, preco,  sabor } = req.body;
    
    // Validação básica
    if (!nome || !preco || !tipo) {
    const errors = [];
    if (!nome) errors.push({ field: 'nome', message: 'nome é obrigatório', code: 'REQUIRED' });
    if (!preco) errors.push({ field: 'preco', message: 'preco é obrigatório', code: 'REQUIRED' });

    return sendError(res, 400, 'Campos obrigatórios', errors);
    }
    
    // Verificar se já existe nomes de comidas repetidos
    const existingNome = await pool.query('SELECT id FROM comida WHERE nome = $1 AND id != $2', [nome, id]);
    if (existingNome.rows.length > 0) {
    return sendError(res, 409, 'Este nome já está em uso por outra comida', [
        { field: 'nome', message: 'Este nome já está em uso por outra comida', code: 'CONFLICT' }
    ]);
    }

    const result = await pool.query(
    `UPDATE comida
    SET nome = $1,
        preco = $2,
        sabor = $3
    WHERE id = $4
    RETURNING id, nome, preco, sabor`,
    [nome, preco, sabor, id]
);

if (result.rows.length === 0) {
    return sendError(res, 404, 'comida não encontrada');
}

    
    return sendSuccess(res, 200, 'comida atualizado com sucesso', result.rows[0]);
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
        'DELETE FROM comida WHERE id = $1 RETURNING id',
        [id]
    );

    if (result.rows.length === 0) {
        return sendError(res, 404, 'comida não encontrada');
    }

    return sendSuccess(
        res,
        200,
        'comida excluída com sucesso'
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