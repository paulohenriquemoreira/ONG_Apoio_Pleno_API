const conectarBanco = require("../config/database");

const entregasController = {
  // Lista todas as entregas com o JOIN para pegar o nome do beneficiário
  listarTodos: async (req, res) => {
    try {
      const db = await conectarBanco();
      const query = `
                SELECT e.*, b.nome AS beneficiario_nome 
                FROM entregas e
                LEFT JOIN beneficiarios b ON e.beneficiario_id = b.id
            `;
      const entregas = await db.all(query);
      res.status(200).json(entregas);
    } catch (error) {
      console.error("❌ Erro ao buscar as entregas:", error);
      res.status(500).json({ mensagem: "Erro interno ao buscar as entregas." });
    }
  },

  // Lista entrega específica por ID com JOIN
  listarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();
      const query = `
                SELECT e.*, b.nome AS beneficiario_nome 
                FROM entregas e
                LEFT JOIN beneficiarios b ON e.beneficiario_id = b.id
                WHERE e.id = ?
            `;
      const entrega = await db.get(query, [id]);

      if (!entrega) {
        return res.status(404).json({ mensagem: "Entrega não encontrada." });
      }

      res.status(200).json(entrega);
    } catch (error) {
      console.error("❌ Erro ao buscar entrega por ID:", error);
      res.status(500).json({ mensagem: "Erro interno ao buscar a entrega." });
    }
  },

  // Função cadastrar nova entrega
  cadastrar: async (req, res) => {
    try {
      const { beneficiario_id, item, categoria, quantidade, observacoes } =
        req.body;
      const dataHoje = new Date().toISOString().split("T")[0];

      const db = await conectarBanco();

      const resultado = await db.run(
        `
                INSERT INTO entregas (beneficiario_id, item, categoria, quantidade, data_entrega, observacoes) 
                VALUES (?, ?, ?, ?, ?, ?)`,
        [beneficiario_id, item, categoria, quantidade, dataHoje, observacoes],
      );

      res.status(201).json({
        mensagem: `Entrega de ${item} registrada com sucesso`,
        id_entrega: resultado.lastID,
      });
    } catch (error) {
      console.error("❌ Erro ao registrar entrega:", error);
      res.status(500).json({ mensagem: "Erro interno no servidor." });
    }
  },
};

module.exports = entregasController;
