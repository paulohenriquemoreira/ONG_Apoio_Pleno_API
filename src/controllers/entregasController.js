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
            const {beneficiario_id, item, categoria, quantidade, observacoes} = req.body;
           
            // Regra do Tempo: Back-end gera a data da doação (Hoje)
            const dataHoje = new Date().toISOString().split('T')[0];
            
            const db = await conectarBanco();
           
            const resultado = await db.run(`
                
                INSERT INTO entregas (beneficiario_id, item, categoria, quantidade, data_entrega, observacoes)VALUES(?,?,?,?,?,?)`,
                [
                    beneficiario_id,
                    item,
                    categoria,
                    quantidade,
                    dataHoje,
                    observacoes
                ]);
            
            
            res.status(201).json({ mensagem: `Entrega de ${item} registada com sucesso`,
                id_entrega:resultado.lastID
            });

        } catch (error) {
            console.error("❌ Erro ao registrar entrega:", error);
            res.status(500).json({mensagem: "Erro interno no servidor." });
        }
    }

};

// Exporta o objeto inteiro
module.exports = entregasController;