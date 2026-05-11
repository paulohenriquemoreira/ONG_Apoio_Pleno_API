const express = require("express");
const rotas = express.Router();  //cria um Filtro de Linha para ligar no server.js
const manutencoesController = require("../controllers/manutencoesController"); //Importa o controller (garçom)


// GET: Buscar informações
rotas.get("/", manutencoesController.listarTodos);
rotas.get("/:id", manutencoesController.listarPorId);


// POST: Cria um novo registro
rotas.post("/", manutencoesController.cadastrar);


// PUT: Atualizar um registro existente
rotas.put("/:id", manutencoesController.atualizar);


// DELETE: Deletar um registro 
rotas.delete("/:id", manutencoesController.deletar);

module.exports = rotas;