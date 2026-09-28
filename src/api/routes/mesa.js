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
    const filtro = req.query.identificacao ? `%${req.query.identificacao}%` : "%";
    console.log("filtro: ", filtro);
    const result = await pool.query('SELECT id, identificacao, horario, tipo FROM mesa WHERE identificacao like $1 ORDER BY id', [filtro]);
    return sendSuccess(res, 200, null, result.rows);
} catch (error) {
    console.error('Erro ao buscar a mesa :', error);
    return sendError(res, 500, 'Erro interno do servidor');

}
});

router.get('/me', verifyToken, isAdmin, async function(req, res) {
try {
    // parâmetro obtido do token pelo middleware
    const id = req.user.id;
    const result = await pool.query('SELECT id, identificacao, tipo FROM mesa WHERE id = $1', [id]);

    if (result.rows.length === 0) {
    return sendError(res, 404, 'mesa não encontrado');
    }

    return sendSuccess(res, 200, null, result.rows[0]);
} catch (error) {
    console.error('Erro ao buscar mesa:', error);
    return sendError(res, 500, 'Erro interno do servidor');
}
});

//Criar mesa

router.post('/', verifyToken, isAdmin, async function(req, res) { 
try {
    const { identificacao, horario, tipo } = req.body;

    console.log('DADOS RECEBIDOS:', req.body);

    if (!identificacao || !horario || !tipo) {
    const errors = [];

    if (!identificacao) {
        errors.push({
        field: 'identificacao',
        message: 'identificacao é obrigatório',
        code: 'REQUIRED'
        });
    }

    if (!horario) {
        errors.push({
        field: 'horario',
        message: 'horario é obrigatório',
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
    `INSERT INTO mesa (identificacao, horario, tipo)
    VALUES ($1, $2, $3)
    RETURNING id, identificacao, horario, tipo`,
    [identificacao, horario, tipo]
    );

    return sendSuccess(
    res,
    201,
    'mesa criada com sucesso',
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
    const { identificacao, horario, tipo } = req.body;
    
    // Validação básica
    if (!identificacao || !horario || !tipo) {
    const errors = [];
    if (!identificacao) errors.push({ field: 'identificacao', message: 'identificacao é obrigatório', code: 'REQUIRED' });
    if (!horario) errors.push({ field: 'horario', message: 'horario é obrigatório', code: 'REQUIRED' });

    return sendError(res, 400, 'Campos obrigatórios', errors);
    }
    
    // Verificar se já existe nomes de comidas repetidos
    const existingNome = await pool.query('SELECT id FROM mesa WHERE identificacao = $1 AND id != $2', [identificacao, id]);
    if (existingNome.rows.length > 0) {
    return sendError(res, 409, 'Esta identificacao já está em uso por outra mesa', [
        { field: 'identificacao', message: 'Esta identificacao já está em uso por outra mesa', code: 'CONFLICT' }
    ]);
    }

    const result = await pool.query(
    `UPDATE mesa
    SET identificacao = $1,
        horario = $2,
        tipo = $3
    WHERE id = $4
    RETURNING id, identificacao, horario, tipo`,
    [nome, preco, sabor, id]
);

if (result.rows.length === 0) {
    return sendError(res, 404, 'mesa não encontrada');
}

    
    return sendSuccess(res, 200, 'mesa atualizado com sucesso', result.rows[0]);
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
        'DELETE FROM mesa WHERE id = $1 RETURNING id',
        [id]
    );

    if (result.rows.length === 0) {
        return sendError(res, 404, 'mesa não encontrada');
    }

    return sendSuccess(
        res,
        200,
        'mesa excluída com sucesso'
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