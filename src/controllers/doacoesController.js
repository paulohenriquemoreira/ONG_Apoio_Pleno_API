const conectarBanco = require("../config/database");

const doacoesController = {
  // Função para listar todas doações
  listarTodos: async (req, res) => {
    try {
      const db = await conectarBanco();
      const doacoes = await db.all(`SELECT * FROM doacoes`);
      res.status(200).json(doacoes);
    } catch (error) {
      console.error("❌ Erro ao buscar as doações:", error);
      res.status(500).json({ mensagem: "Erro interno ao buscar as doações." });
    }
  },

  // Função lista doação específica
  listarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();
      const doacao = await db.get(`SELECT * FROM doacoes WHERE id = ?`, [id]);
      if (!doacao)
        return res.status(404).json({ mensagem: "Doação não encontrada." });
      res.status(200).json(doacao);
    } catch (error) {
      console.error("❌ Erro ao buscar doação por ID:", error);
      res.status(500).json({ mensagem: "Erro interno." });
    }
  },

  // Função cadastrar nova doação
  cadastrar: async (req, res) => {
    try {
      const {
        doador,
        categoria,
        item,
        quantidade,
        unidade_medida,
        observacoes,
      } = req.body;
      const nomeDoador = doador || "Anônimo";
      const dataHoje = new Date().toISOString().split("T")[0];
      const db = await conectarBanco();

      const resultado = await db.run(
        `INSERT INTO doacoes (doador, categoria, item, quantidade, unidade_medida, data_doacao, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          nomeDoador,
          categoria,
          item,
          quantidade,
          unidade_medida,
          dataHoje,
          observacoes,
        ],
      );

      if (categoria === "Equipamento") {
        await db.run(
          `INSERT INTO equipamentos (nome, categoria, status, data_aquisicao, observacoes) VALUES (?, ?, ?, ?, ?)`,
          [
            item,
            "Doação",
            "Disponível",
            dataHoje,
            `Adicionado automaticamente via doação #${resultado.lastID}`,
          ],
        );
      }

      res
        .status(201)
        .json({ mensagem: "Doação registrada!", id_doacao: resultado.lastID });
    } catch (error) {
      console.error("❌ Erro ao cadastrar doação:", error);
      res.status(500).json({ mensagem: "Erro ao registrar doação." });
    }
  },

  // Função para atualizar doação
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ mensagem: "ID da doação não fornecido." });
      }

      const {
        doador,
        categoria,
        item,
        quantidade,
        unidade_medida,
        observacoes,
      } = req.body;
      
      const db = await conectarBanco();

      const resultado = await db.run(
        `UPDATE doacoes SET doador=?, categoria=?, item=?, quantidade=?, unidade_medida=?, observacoes=? WHERE id=?`,
        [doador, categoria, item, quantidade, unidade_medida, observacoes, id],
      );

      if (resultado.changes === 0) {
        return res.status(404).json({ mensagem: "Doação não encontrada para atualização." });
      }

      res.status(200).json({ mensagem: "Doação atualizada com sucesso!" });
    } catch (error) {
      console.error("❌ Erro ao atualizar doação:", error);
      res.status(500).json({ mensagem: "Erro ao atualizar doação." });
    }
  },
};

module.exports = doacoesController;