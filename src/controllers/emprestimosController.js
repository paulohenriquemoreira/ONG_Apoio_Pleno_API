const conectarBanco = require("../config/database");

const emprestimosController = {
  listarTodos: async (req, res) => {
    try {
      const db = await conectarBanco();
      const query = `
        SELECT e.*, 
               b.nome AS beneficiario_nome, 
               eq.nome AS equipamento_nome 
        FROM emprestimos e
        LEFT JOIN beneficiarios b ON e.beneficiario_id = b.id
        LEFT JOIN equipamentos eq ON e.equipamento_id = eq.id
      `;
      const emprestimos = await db.all(query);
      res.status(200).json(emprestimos);
    } catch (error) {
      console.error("❌ Erro ao buscar empréstimos:", error);
      res
        .status(500)
        .json({ mensagem: "Erro interno ao buscar os empréstimos." });
    }
  },

  cadastrar: async (req, res) => {
    try {
      const { beneficiario_id, equipamento_id, observacoes } = req.body;
      const db = await conectarBanco();

      const equipamento = await db.get(
        `SELECT status FROM equipamentos WHERE id = ?`,
        [equipamento_id],
      );
      if (!equipamento)
        return res
          .status(404)
          .json({ mensagem: "Equipamento não encontrado." });
      if (equipamento.status !== "Disponível")
        return res.status(400).json({ mensagem: "Equipamento indisponível." });

      const dataHoje = new Date().toISOString().split("T")[0];
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + 30);
      const data_fim = dataLimite.toISOString().split("T")[0];

      const resultado = await db.run(
        `INSERT INTO emprestimos (beneficiario_id, equipamento_id, data_inicio, data_fim, status, observacoes) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          beneficiario_id,
          equipamento_id,
          dataHoje,
          data_fim,
          "Ativo",
          observacoes,
        ],
      );

      await db.run(
        `UPDATE equipamentos SET status = 'Emprestado' WHERE id = ?`,
        [equipamento_id],
      );
      res
        .status(201)
        .json({ mensagem: "Empréstimo realizado!", id: resultado.lastID });
    } catch (error) {
      res.status(500).json({ mensagem: "Erro ao registrar empréstimo." });
    }
  },

  // ROTA ESPECÍFICA PARA DEVOLUÇÃO
  devolver: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, observacoes } = req.body;
      const db = await conectarBanco();

      const emp = await db.get(`SELECT * FROM emprestimos WHERE id = ?`, [id]);
      if (!emp)
        return res.status(404).json({ mensagem: "Empréstimo não encontrado." });

      await db.run(
        `UPDATE emprestimos SET status = 'Concluído', data_devolucao = ? WHERE id = ?`,
        [new Date().toISOString().split("T")[0], id],
      );
      await db.run(`UPDATE equipamentos SET status = ? WHERE id = ?`, [
        estado,
        emp.equipamento_id,
      ]);

      res.status(200).json({ mensagem: "Devolução registrada!" });
    } catch (error) {
      res.status(500).json({ mensagem: "Erro ao devolver." });
    }
  },

  // ROTA ESPECÍFICA PARA RENOVAÇÃO

  renovar: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();

      // 1. Calcula as novas datas no Back-end
      const hoje = new Date();
      const data_inicio = hoje.toISOString().split("T")[0]; // Data de hoje

      const data_fim = new Date(hoje);
      data_fim.setDate(data_fim.getDate() + 15); // + 15 dias
      const data_fim_str = data_fim.toISOString().split("T")[0];

      // 2. Atualiza no banco
      await db.run(
        `UPDATE emprestimos SET data_inicio = ?, data_fim = ? WHERE id = ?`,
        [data_inicio, data_fim_str, id],
      );

      res.status(200).json({
        mensagem: "Renovado com sucesso!",
        nova_data_inicio: data_inicio,
        nova_data_fim: data_fim_str,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao renovar." });
    }
  },

  deletar: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();
      const emp = await db.get(`SELECT * FROM emprestimos WHERE id = ?`, [id]);
      if (emp && emp.status !== "Concluído") {
        await db.run(
          `UPDATE equipamentos SET status = 'Disponível' WHERE id = ?`,
          [emp.equipamento_id],
        );
      }
      await db.run(`DELETE FROM emprestimos WHERE id = ?`, [id]);
      res.status(200).json({ mensagem: "Excluído." });
    } catch (error) {
      res.status(500).json({ mensagem: "Erro ao deletar." });
    }
  },
};

module.exports = emprestimosController;
