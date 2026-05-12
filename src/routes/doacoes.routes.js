const express = require("express");
const rotas = express.Router();  //cria um Filtro de Linha para ligar no server.js
// Importa o Controller
const doacoesController = require("../controllers/doacoesController");


// GET: Buscar informações
rotas.get("/", doacoesController.listarTodos);
rotas.get("/:id", doacoesController.listarPorId);


// POST: Cria um novo registro
rotas.post("/", doacoesController.cadastrar);

module.exports = rotas;