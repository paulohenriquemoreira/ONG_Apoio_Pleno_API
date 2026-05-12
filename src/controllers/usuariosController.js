// src/controllers/usuariosController.js
const conectarBanco = require("../config/database");

const usuariosController = {
    login: async (req, res) => {
        try {
            const { email, senha } = req.body;
            const db = await conectarBanco();

            // Busca o usuário no banco pelo e-mail
            const usuario = await db.get(`SELECT * FROM usuarios WHERE email = ?`, [email]);

            // Validação de Segurança: Se não achar o e-mail OU a senha não bater
            if (!usuario || usuario.senha !== senha) {
                return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
            }

            // Login com sucesso! (Retorna os dados, mas ESCONDE a senha na respostas.)
            res.status(200).json({
                mensagem: "Login realizado com sucesso!",
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });

        } catch (error) {
            console.error("❌ Erro ao fazer login:", error);
            res.status(500).json({ mensagem: "Erro interno no servidor." });
        }
    }
};

module.exports = usuariosController;