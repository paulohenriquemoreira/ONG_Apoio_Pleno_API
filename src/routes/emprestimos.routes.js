const express = require("express");
const rotas = express.Router();  //cria um Filtro de Linha para ligar no server.js
const emprestimosController = require("../controllers/emprestimosController"); //Importa o controller (garçom)


// GET: Buscar informações
rotas.get("/", emprestimosController.listarTodos);
rotas.get("/:id", emprestimosController.listarPorId);


// POST: Cria um novo registro
rotas.post("/", emprestimosController.cadastrar);


// PUT: Atualizar um registro existente
rotas.put('/devolver/:id', emprestimosController.devolver);
rotas.put('/renovar/:id', emprestimosController.renovar);


// DELETE: Deletar um registro 
rotas.delete("/:id", emprestimosController.deletar);

module.exports = rotas;