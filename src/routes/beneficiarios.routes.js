const express = require("express");
const rotas = express.Router();  //cria um Filtro de Linha para ligar no server.js
const upload = require('../config/multer');  //Biblioteca para tratar as imagens do uploads
const beneficiariosController = require("../controllers/beneficiariosController"); //Importa o controller (garçom)


// GET: Buscar informações
rotas.get("/", beneficiariosController.listarTodos);
rotas.get("/:id", beneficiariosController.listarPorId);


// POST: Cria um novo registro - o trecho "upload.single("foto")" serve como um pedágio do Multer entre a rota e o Controller!
rotas.post("/", upload.single("foto"), beneficiariosController.cadastrar);


// PUT: Atualizar um registro existente
rotas.put("/:id", upload.single("foto"), beneficiariosController.atualizar);


// DELETE: Deletar um registro 
rotas.delete("/:id", beneficiariosController.deletar);

module.exports = rotas;