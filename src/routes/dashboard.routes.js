const express = require("express");
const rotas = express.Router();
const dashboardController = require("../controllers/dashboardController");

// GET: Buscar o resumão de todos os dados para o painel
rotas.get("/", dashboardController.obterResumo);

module.exports = rotas;