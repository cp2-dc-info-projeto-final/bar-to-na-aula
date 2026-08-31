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

//Criar Comidas

router.post('/', async function(req, res) {
    try {
    const { nome, preco, sabor = 'salgado' } = req.body;
        
    if (!nome || !sabor || !preco ) {
        const errors = [];
        if (!nome) errors.push({ field: 'nome', message: 'nome é obrigatório', code: 'REQUIRED' });
        if (!preco) errors.push({ field: 'preco', message: 'preco é obrigatória', code: 'REQUIRED' });

        return sendError(res, 400, 'campos obrigatórios', errors); 
    }
    
    const existing = await pool.query('SELECT id FROM bebida WHERE nome = $1', [nome]);
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
    
    const existingpreco = await pool.query('SELECT id FROM preco WHERE tamanho = $1', [preco]);
    if (existingTamanho.rows.length > 0) {
        return sendError(res, 409, 'Este tamanho procede', [
        { field: 'tamanho', message: 'Este tamanho procede', code: 'CONFLICT' }
        ]);
    }
    
    }
    catch (error) {
    console.error('Erro ao criar bebida:', error);
    return sendError(res, 500, 'Erro interno do servidor')
    }});