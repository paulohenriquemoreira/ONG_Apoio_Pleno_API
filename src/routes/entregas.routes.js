const express = require("express");
const rotas = express.Router();  //cria um Filtro de Linha para ligar no server.js
// Importa o Controller
const entregasController = require("../controllers/entregasController");

// GET: Buscar informações
rotas.get("/", entregasController.listarTodos);
rotas.get("/:id", entregasController.listarPorId);


// POST: Cria um novo registro
rotas.post("/", entregasController.cadastrar);

// DELETE: Deleta registro - utilizado para cancelamento
rotas.delete('/entregas/:id', entregasController.deletar);

module.exports = rotas;
