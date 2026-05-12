//Conexão com o banco
const conectarBanco = require("../config/database");

const entregasController = {
    
    // Função para listar todas as entregas
    listarTodos: async (req, res) => {
        try {
            const db = await conectarBanco();
            const entregas = await db.all(`SELECT * FROM entregas`);
            res.status(200).json(entregas);
        } catch (error) {
            console.error("❌ Erro ao buscar as entregas :", error);
            res.status(500).json({mensagem: "Erro interno ao buscar as entregas."});
        }
    },

    // Função lista entrega específica por ID
    listarPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const db = await conectarBanco();
            const entrega = await db.get(`SELECT * FROM entregas WHERE id = ?`, [id]);

            if (!entrega) {
                return res.status(404).json({ mensagem: "Entrega não encontrada." });
            }

            res.status(200).json(entrega);  
        } catch (error) {
            console.error("❌ Erro ao buscar entrega por ID:", error);
            res.status(500).json({ mensagem: "Erro interno ao buscar a entrega." });
        }
    },

    // Função cadastrar nova entrega (A SAÍDA dos alimentos/roupas)
    cadastrar: async (req, res) => {
        try {
            // 1. Receber os dados do req.body (beneficiario_id, item, categoria, quantidade, observacoes)
            
            // 2. Gerar a data de hoje (dataHoje)

            // 3. Conectar ao banco
            
            // 4. Fazer o INSERT na tabela 'entregas'

            // 5. Retornar res.status(201) de sucesso!
            
            res.status(201).json({ mensagem: "Acesso à rota de cadastro funcionando! Falta a lógica do banco." });

        } catch (error) {
            console.error("❌ Erro ao registrar entrega:", error);
            res.status(500).json({mensagem: "Erro interno no servidor." });
        }
    }

};

// Exporta o objeto inteiro
module.exports = entregasController;