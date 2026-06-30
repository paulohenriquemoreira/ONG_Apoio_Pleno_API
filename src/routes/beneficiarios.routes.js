const express = require("express");

// Cria a instância do roteador para gerenciar os caminhos específicos da entidade.
const rotas = express.Router();

// Importa a biblioteca responsável por processar os uploads de arquivos em multipart/form-data.
const upload = require("../config/multer");

// Importa o controlador que abriga as lógicas de negócio dos beneficiários.
const beneficiariosController = require("../controllers/beneficiariosController");

// Intercepta a requisição GET na raiz e devolve a listagem completa.
rotas.get("/", beneficiariosController.listarTodos);

// Intercepta a requisição GET baseada no parâmetro ID e retorna o registro correspondente.
rotas.get("/:id", beneficiariosController.listarPorId);

// Intercepta a requisição POST, extrai o arquivo de imagem via multer e finaliza a criação.
rotas.post("/", upload.single("foto"), beneficiariosController.cadastrar);

// Intercepta a requisição PUT, permite a manipulação de um arquivo anexo opcional e realiza a alteração.
rotas.put("/:id", upload.single("foto"), beneficiariosController.atualizar);

// Intercepta a requisição DELETE mapeando a remoção do registro apontado pelo ID.
rotas.delete("/:id", beneficiariosController.deletar);

module.exports = rotas;
