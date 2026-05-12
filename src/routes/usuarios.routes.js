// src/routes/usuarios.routes.js
const express = require("express");
const rotas = express.Router();
const usuariosController = require("../controllers/usuariosController");

// Rota de Login (Login é sempre POST, pois enviamos dados sensíveis no Body)
rotas.post("/login", usuariosController.login);

module.exports = rotas;