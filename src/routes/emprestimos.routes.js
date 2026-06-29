const express = require("express");
const rotas = express.Router();
const emprestimosController = require("../controllers/emprestimosController");

// ADICIONE ESTE LOG PARA DEPURAR
console.log("DEBUGANDO EMPRESTIMOS CONTROLLER:");
console.log("listarTodos é função?", typeof emprestimosController.listarTodos === 'function');
console.log("cadastrar é função?", typeof emprestimosController.cadastrar === 'function');
console.log("devolver é função?", typeof emprestimosController.devolver === 'function');
console.log("renovar é função?", typeof emprestimosController.renovar === 'function');

rotas.get("/", emprestimosController.listarTodos);
rotas.post("/", emprestimosController.cadastrar);
rotas.put('/devolver/:id', emprestimosController.devolver);
rotas.put('/renovar/:id', emprestimosController.renovar);
rotas.delete("/:id", emprestimosController.deletar);

module.exports = rotas;