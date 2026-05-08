const express = require("express");
const rotas = express.Router();  //cria um Filtro de Linha para ligar no server.js
const equipamentosController = require("../controllers/equipamentosController"); //Importa o controller (garçom)


// GET: Buscar informações
rotas.get("/", equipamentosController.listarTodos);
rotas.get("/:id", equipamentosController.listarPorId);


// POST: Cria um novo registro
rotas.post("/", equipamentosController.cadastrar);


// PUT: Atualizar um registro existente
rotas.put("/:id", equipamentosController.atualizar);


// DELETE: Deletar um registro 
rotas.delete("/:id", equipamentosController.deletar);

module.exports = rotas;