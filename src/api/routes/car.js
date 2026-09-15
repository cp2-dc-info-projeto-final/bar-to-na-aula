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

// SELECT 
//     CASE 
//         WHEN coluna_A IS NOT NULL THEN coluna_A
//         ELSE coluna_B
//     END AS resultado
// FROM utilizadores;

//  rotas para  selecioanar a busca do carrinho
router.get('/', verifyToken, async function(res) {
    try {
    const result = await pool.query(`
    SELECT 
        
        item_carrinho.id,
        item_carrinho.quantidade,
        bebida.id AS id_bebida,
        bebida.nome,
        bebida.preco,
        FROM item_carrinho
        INNER JOIN bebida ON item_carrinho.id_bebida = bebida.id
        
        item_carrinho.id,
        item_carrinho.quantidade,
        comida.id AS id_comida,
        comida.nome,
        comida.preco,
        FROM item_carrinho
        INNER JOIN comida ON item_carrinho.id_comida = comida.id
        
    CASE 
        WHEM id_bebida IS NOT NULL 
        THEN id_bebida ELSE id_comida 
    END AS id_produto,
    CASE 
        WHEM nome_bebida IS NOT NULL 
        THEN nome_bebida ELSE nome_comida 
    END AS nome_produto,
    CASE 
        WHEM preco_bebida IS NOT NULL 
        THEN preco_bebida ELSE preco_comida 
    END AS preco_produto, ;` );
    } catch (error) {
    console.error('Erro ao carregar carrinho:', error);
    return sendError(res, 500, 'Erro ao carregar carrinho:');
    }
});

// SELECT c.nome, p.id_pedido, i.quantidade
// FROM clientes AS c
// INNER JOIN pedidos AS p ON c.id = p.cliente_id
// INNER JOIN itens_pedido AS i ON p.id_pedido = i.pedido_id;


// c.id_comida, b.id_bebida
// FROM comidas AS c
// INNER JOIN comidas AS c ON c.id = b.comida_id  

// c.id_comida, b.id_bebida
// FROM comidas AS c
// INNER JOIN comidas AS c ON c.id = b.comida_id  

// c.id_comida, b.id_bebida
// FROM comidas AS c
// INNER JOIN comidas AS c ON c.id = b.comida_id  






































































































//cassio