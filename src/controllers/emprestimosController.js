const conectarBanco = require("../config/database");

const emprestimosController = {
  // Função para listar todos os empréstimos COM OS NOMES (usando JOIN)
  listarTodos: async (req, res) => {
    try {
      const db = await conectarBanco();

      // Corrigido: Usando JOIN para trazer nome do beneficiário e equipamento
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

  // Função para listar empréstimo específico
  listarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();

      const emprestimoEspecifico = await db.get(
        `SELECT e.*, b.nome AS beneficiario_nome, eq.nome AS equipamento_nome 
         FROM emprestimos e
         LEFT JOIN beneficiarios b ON e.beneficiario_id = b.id
         LEFT JOIN equipamentos eq ON e.equipamento_id = eq.id
         WHERE e.id = ?`,
        [id],
      );

      if (!emprestimoEspecifico) {
        return res.status(404).json({ mensagem: "Empréstimo não encontrado." });
      }

      res.status(200).json(emprestimoEspecifico);
    } catch (error) {
      console.error("❌ Erro ao buscar empréstimo por ID:", error);
      res
        .status(500)
        .json({ mensagem: "Erro interno ao buscar o empréstimo." });
    }
  },

  // Função para cadastrar novo empréstimo
  cadastrar: async (req, res) => {
    try {
      const { beneficiario_id, equipamento_id, observacoes } = req.body;
      const db = await conectarBanco();

      const equipamento = await db.get(
        `SELECT status FROM equipamentos WHERE id = ?`,
        [equipamento_id],
      );

      if (!equipamento) {
        return res
          .status(404)
          .json({ mensagem: "Equipamento não encontrado." });
      }
      if (equipamento.status !== "Disponível") {
        return res
          .status(400)
          .json({
            mensagem: `Empréstimo negado. Status atual: ${equipamento.status}`,
          });
      }

      const dataHoje = new Date();
      const data_inicio = dataHoje.toISOString().split("T")[0];
      const dataLimite = new Date(dataHoje);
      dataLimite.setDate(dataLimite.getDate() + 30);
      const data_fim = dataLimite.toISOString().split("T")[0];

      const resultado = await db.run(
        `INSERT INTO emprestimos (beneficiario_id, equipamento_id, data_inicio, data_fim, status, observacoes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          beneficiario_id,
          equipamento_id,
          data_inicio,
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
        .json({
          mensagem: "Empréstimo realizado com sucesso!",
          id: resultado.lastID,
        });
    } catch (error) {
      console.error("❌ Erro ao registrar empréstimo:", error);
      res.status(500).json({ mensagem: "Erro interno no servidor." });
    }
  },

  // Função para atualizar (Renovação ou Devolução)
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, data_fim, observacoes } = req.body;
      const db = await conectarBanco();

      const emprestimoAtual = await db.get(
        `SELECT * FROM emprestimos WHERE id = ?`,
        [id],
      );
      if (!emprestimoAtual)
        return res.status(404).json({ mensagem: "Empréstimo não encontrado." });

      let data_devolucao_final = emprestimoAtual.data_devolucao;

      if (status === "Concluído") {
        data_devolucao_final = new Date().toISOString().split("T")[0];
        await db.run(
          `UPDATE equipamentos SET status = 'Disponível' WHERE id = ?`,
          [emprestimoAtual.equipamento_id],
        );
      }

      await db.run(
        `UPDATE emprestimos SET status=?, data_fim=?, observacoes=?, data_devolucao=? WHERE id=?`,
        [status, data_fim, observacoes, data_devolucao_final, id],
      );

      res.status(200).json({ mensagem: "Atualizado com sucesso!" });
    } catch (error) {
      console.error("❌ Erro ao atualizar:", error);
      res.status(500).json({ mensagem: "Erro interno." });
    }
  },

  // Função para deletar
  deletar: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();

      const emprestimo = await db.get(
        `SELECT * FROM emprestimos WHERE id = ?`,
        [id],
      );
      if (!emprestimo)
        return res.status(404).json({ mensagem: "Empréstimo não encontrado." });

      if (emprestimo.status !== "Concluído") {
        await db.run(
          `UPDATE equipamentos SET status = 'Disponível' WHERE id = ?`,
          [emprestimo.equipamento_id],
        );
      }

      await db.run(`DELETE FROM emprestimos WHERE id = ?`, [id]);

      res
        .status(200)
        .json({ mensagem: "Registro deletado e equipamento liberado." });
    } catch (error) {
      console.error("❌ Erro ao deletar:", error);
      res.status(500).json({ mensagem: "Erro ao deletar." });
    }
  },
};

module.exports = emprestimosController;
