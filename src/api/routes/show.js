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
    const filtro = req.query.artista ? `%${req.query.artista}%` : "%";
    console.log("filtro: ", filtro);
    const result = await pool.query('SELECT id, artista, horario, genero FROM mesa WHERE artista like $1 ORDER BY id', [filtro]);
    return sendSuccess(res, 200, null, result.rows);
} catch (error) {
    console.error('Erro ao buscar artista :', error);
    return sendError(res, 500, 'Erro interno do servidor');

}
});

router.get('/me', verifyToken, isAdmin, async function(req, res) {
try {
    // parâmetro obtido do token pelo middleware
    const id = req.user.id;
    const result = await pool.query('SELECT id, artista, horario FROM mesa WHERE id = $1', [id]);

    if (result.rows.length === 0) {
    return sendError(res, 404, 'artista não encontrado');
    }

    return sendSuccess(res, 200, null, result.rows[0]);
} catch (error) {
    console.error('Erro ao buscar artista:', error);
    return sendError(res, 500, 'Erro interno do servidor');
}
});

//Criar mesa

router.post('/', verifyToken, isAdmin, async function(req, res) { 
try {
    const { artista, horario, genero } = req.body;

    console.log('DADOS RECEBIDOS:', req.body);

    if (!artista || !horario || !genero) {
    const errors = [];

    if (!artista) {
        errors.push({
        field: 'artista',
        message: 'artista é obrigatório',
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

    if (!genero) {
        errors.push({
        field: 'genero',
        message: 'genero é obrigatório',
        code: 'REQUIRED'
        });
    }

    return sendError(res, 400, 'Campos obrigatórios', errors);
    }

    const result = await pool.query(
    `INSERT INTO mesa (artista, horario, genero)
    VALUES ($1, $2, $3)
    RETURNING id, artista, horario, genero`,
    [artista, horario, genero]
    );

    return sendSuccess(
    res,
    201,
    'show marcado com sucesso',
    result.rows[0]
    );

} catch (error) {
    console.error('Erro ao agendar show:', error);

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
    const { artista, horario, genero } = req.body;
    
    // Validação básica
    if (!artista || !horario || !genero) {
    const errors = [];
    if (!artista) errors.push({ field: 'artista', message: 'artista é obrigatório', code: 'REQUIRED' });
    if (!horario) errors.push({ field: 'horario', message: 'horario é obrigatório', code: 'REQUIRED' });

    return sendError(res, 400, 'Campos obrigatórios', errors);
    }
    
    // Verificar se já existe nomes de comidas repetidos
    const existingNome = await pool.query('SELECT id FROM show WHERE artista = $1 AND id != $2', [identificacao, id]);
    if (existingNome.rows.length > 0) {
    return sendError(res, 409, 'Este artista já está em uso por outro artista', [
        { field: 'identificacao', message: 'Este artista já está em uso por outro artista', code: 'CONFLICT' }
    ]);
    }

    const result = await pool.query(
    `UPDATE mesa
    SET artista = $1,
        horario = $2,
        genero = $3
    WHERE id = $4
    RETURNING id, artista, horario, genero`,
    [artista, horario, genero, id]
);

if (result.rows.length === 0) {
    return sendError(res, 404, 'show não encontrada');
}

    
    return sendSuccess(res, 200, 'show atualizado com sucesso', result.rows[0]);
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
        'DELETE FROM show WHERE id = $1 RETURNING id',
        [id]
    );

    if (result.rows.length === 0) {
        return sendError(res, 404, 'show não encontrada');
    }

    return sendSuccess(
        res,
        200,
        'show excluído com sucesso'
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