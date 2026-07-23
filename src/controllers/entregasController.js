const conectarBanco = require("../config/database");

const entregasController = {
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
      console.error("Erro ao buscar entregas:", error);
      res.status(500).json({ mensagem: "Erro ao buscar entregas." });
    }
  },

  listarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();
      const entrega = await db.get(`SELECT * FROM entregas WHERE id = ?`, [id]);
      if (!entrega)
        return res.status(404).json({ mensagem: "Entrega não encontrada." });
      res.status(200).json(entrega);
    } catch (error) {
      res.status(500).json({ mensagem: "Erro interno." });
    }
  },

  cadastrar: async (req, res) => {
    try {
      const { beneficiario_id, item, categoria, quantidade, observacoes } =
        req.body;
      const dataHoje = new Date().toISOString().split("T")[0];
      const db = await conectarBanco();

      const resultado = await db.run(
        `INSERT INTO entregas (beneficiario_id, item, categoria, quantidade, data_entrega, observacoes) VALUES (?, ?, ?, ?, ?, ?)`,
        [beneficiario_id, item, categoria, quantidade, dataHoje, observacoes],
      );

      res.status(201).json({
        mensagem: "Entrega registrada!",
        id_entrega: resultado.lastID,
      });
    } catch (error) {
      console.error("Erro ao registrar entrega:", error);
      res.status(500).json({ mensagem: "Erro ao registrar entrega." });
    }
  },

  // Permite o cancelamento/exclusão da entrega
  deletar: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();
      await db.run(`DELETE FROM entregas WHERE id = ?`, [id]);
      res.status(200).json({ mensagem: "Entrega cancelada com sucesso!" });
    } catch (error) {
      res.status(500).json({ mensagem: "Erro ao cancelar entrega." });
    }
  },
};

module.exports = entregasController;
