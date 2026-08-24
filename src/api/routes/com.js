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
    const result = await pool.query('SELECT id, nome, preço, marca, tamanho,  tipo FROM bebida WHERE nome like $1 ORDER BY id', [filtro]);
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
    const result = await pool.query('SELECT id, nome, tipo FROM bebida WHERE id = $1', [id]);

    if (result.rows.length === 0) {
    return sendError(res, 404, 'bebida não encontrado');
    }

    return sendSuccess(res, 200, null, result.rows[0]);
} catch (error) {
    console.error('Erro ao buscar preoduto:', error);
    return sendError(res, 500, 'Erro interno do servidor');
}
});

//Criar bebida

router.post('/cadastro', async function(req, res) {
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

    const existingPreço = await pool.query('SELECT id FROM preço WHERE tamanho = $1', [preço]);
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
  //Delete
    router.delete('/:cadastro', verifyToken, isAdmin, async function(req, res) {
    try {
    const { id } = req.params;

      // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM bebida WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
        return sendError(res, 404, 'bebida não encontrado');
}

    await pool.query('DELETE FROM bebida WHERE id = $1', [id]);

    return sendSuccess(res, 200, 'bebida deletado com sucesso');
    } catch (error) {
    console.error('Erro ao deletar bebida:', error);
    return sendError(res, 500, 'Erro interno do servidor');
    }
});

/* PUT - Atualizar bebida*/
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
    try {
    const { id } = req.params;
    const { nome, preço, marca, tamanho, tipo } = req.body;
    
    // Validação básica
    if (!nome || !preço || !marca || !tamanho || !tipo) {
    const errors = [];
    if (!nome) errors.push({ field: 'nome', message: 'nome é obrigatório', code: 'REQUIRED' });
    if (!preço) errors.push({ field: 'preço', message: 'preço é obrigatório', code: 'REQUIRED' });
    if (!marca) errors.push({ field: 'marca', message: 'marca é obrigatório', code: 'REQUIRED' });
    if (!tamanho) errors.push({ field: 'tamanho', message: 'tamanho é obrigatório', code: 'REQUIRED' });
    if (!tipo) errors.push({ field: 'tipo', code: 'REQUIRED' });

    return sendError(res, 400, 'Campos obrigatórios', errors);
    }
    
    // Verificar se o usuário existe
    const userExists = await pool.query('SELECT id FROM bebida WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
    return sendError(res, 404, 'bebida não encontrado');
    }
    
    // Verificar se já existe nomes de bebidas repetidos
    const existingUser = await pool.query('SELECT id FROM bebida WHERE login = $1 AND id != $2', [nome, id]);
    if (existingUser.rows.length > 0) {
    return sendError(res, 409, 'Este nome  já está em uso por outro usuário', [
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
    
    let query, params;
    const result = await pool.query(query, params);
    
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

});

// // Tentativa de cadastro de bebida
// router.post('/cadastro' (req,res)); {
//   const{ nome , preço} = req.body;
//   if (!nome || !preço){
//     return res.status(400).json({ error: " Coloque nome e preço do bebida" });

//   }
// };



module.exports = router;