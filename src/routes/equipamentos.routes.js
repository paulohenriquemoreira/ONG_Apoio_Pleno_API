const express = require("express");
const rotas = express.Router();  //cria um Filtro de Linha para ligar no server.js
const equipamentosController = require("../controllers/equipamentosController"); //Importa o controller (garçom)


// GET: Buscar informações
rotas.get("/", equipamentosController.listarTodos);
rotas.get("/:id", equipamentosController.listarPorId);


// POST: Cria um novo registro



// PUT: Atualizar um registro existente




// DELETE: Deletar um registro 


module.exports = rotas;