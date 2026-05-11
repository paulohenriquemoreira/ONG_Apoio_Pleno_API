const conectarBanco = require("../config/database");

const manutencoesController = {
  // Função de listar todos equipamentos em manutenção
  listarTodos: async (req, res) => {
    try {
      const db = await conectarBanco();
      const manutencoes = await db.all(`SELECT * FROM manutencoes`);
      res.status(200).json(manutencoes);
    } catch (error) {
      console.error("❌ Erro ao buscar manutenções :", error);
      res.status(500).json({ mensagem: "Erro interno ao buscar as manutenções." });
    }
  },

  // Função de listar manutenção específica.
  listarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();

      
      const manutencao = await db.get(`SELECT * FROM manutencoes WHERE id = ?`, [id]);

      if (!manutencao) {
        return res.status(404).json({ mensagem: "Manutenção não encontrada." });
      }

      res.status(200).json(manutencao);
    } catch (error) {
      console.error("❌ Erro ao buscar manutenção por ID:", error);
      res.status(500).json({ mensagem: "Erro interno ao buscar a manutenção." });
    }
  },

  // Função de cadastrar nova manutenção.
  cadastrar: async (req, res) => {
    try {
      const { equipamento_id, descricao, observacoes } = req.body;
      const db = await conectarBanco();

      // ==================================================================
      // REGRA DE NEGÓCIO 1: O equipamento existe e está disponível?
      // ==================================================================
      // Buscando na tabela EQUIPAMENTOS!
      const equipamento = await db.get(`SELECT status FROM equipamentos WHERE id = ?`, [equipamento_id]);

      if (!equipamento) {
        return res.status(404).json({ mensagem: "Equipamento não encontrado." });
      }

      // Se estiver emprestado ou já em manutenção, bloqueia!
      if (equipamento.status !== "Disponível") {
        return res.status(400).json({
          mensagem: `Manutenção negada. O equipamento atualmente está: ${equipamento.status}`,
        });
      }

      // ==================================================================
      // REGRA DE NEGÓCIO 2: Geração de Datas e Status
      // ==================================================================
      const dataHoje = new Date();
      const data_inicio = dataHoje.toISOString().split("T")[0];
      const data_cadastro = data_inicio;
      const statusManutencao = "Em andamento"; // Status DA MANUTENÇÃO
      const data_fim = null; // Só preenche quando terminar

      // ==================================================================
      // EXECUÇÃO NO BANCO DE DADOS
      // ==================================================================
      const resultado = await db.run(
        `INSERT INTO manutencoes(equipamento_id, data_inicio, data_fim, descricao, observacoes, status, data_cadastro)
         VALUES(?,?,?,?,?,?,?)`,
        [equipamento_id, data_inicio, data_fim, descricao, observacoes, statusManutencao, data_cadastro]
      );

      // CORREÇÃO: Trancando o item na tabela EQUIPAMENTOS
      await db.run(
        `UPDATE equipamentos SET status = 'Em manutenção' WHERE id = ?`,
        [equipamento_id]
      );

      res.status(201).json({
        mensagem: "Manutenção registrada! O status do equipamento foi atualizado para 'Em manutenção'.",
        manutencao_id: resultado.lastID
      });
    } catch (error) {
      console.error("❌ Erro ao registrar manutenção:", error);
      res.status(500).json({ mensagem: "Erro interno ao processar a manutenção." });
    }
  },

  // Função para atualizar (Concluir) a manutenção
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      // Precisamos receber o status para saber se a ONG concluiu o conserto!
      const { status, descricao, observacoes } = req.body; 

      const db = await conectarBanco();

      const manutencaoAtual = await db.get(`SELECT * FROM manutencoes WHERE id = ?`, [id]);

      if (!manutencaoAtual) {
        return res.status(404).json({ mensagem: "Registro de manutenção não encontrado." });
      }

      // A "Regra Mágica" da Conclusão
      let data_fim_final = manutencaoAtual.data_fim;

      // Se o usuário mandou "Concluída", registramos a data e liberamos o item!
      if (status === "Concluída" && manutencaoAtual.status !== "Concluída") {
        const dataHoje = new Date();
        data_fim_final = dataHoje.toISOString().split("T")[0];

        //Liberando na tabela EQUIPAMENTOS
        await db.run(
          `UPDATE equipamentos SET status = 'Disponível' WHERE id = ?`,
          [manutencaoAtual.equipamento_id]
        );
      }

      await db.run(
        `UPDATE manutencoes SET status=?, descricao=?, observacoes=?, data_fim=? WHERE id = ?`,
        [status, descricao, observacoes, data_fim_final, id]
      );

      res.status(200).json({ mensagem: `Manutenção ${id} atualizada com sucesso!` });
    } catch (error) {
      console.error("❌ Erro ao atualizar manutenção:", error);
      res.status(500).json({ mensagem: "Erro interno ao atualizar a manutenção." });
    }
  },

  // Função para deletar registro de manutenção
  deletar: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();

      const manutencao = await db.get(`SELECT * FROM manutencoes WHERE id = ?`, [id]);

      if (!manutencao) {
        
        return res.status(404).json({
          mensagem: `A manutenção de ID ${id} não foi encontrada para exclusão.`,
        });
      }

      // Se deletar uma manutenção que estava "Em andamento", precisará liberar o equipamento!
      if (manutencao.status !== 'Concluída') {
        //Liberando na tabela EQUIPAMENTOS
        await db.run(`UPDATE equipamentos SET status = 'Disponível' WHERE id = ?`, [manutencao.equipamento_id]);
      }

      await db.run(`DELETE FROM manutencoes WHERE id = ?`, [id]);

      res.status(200).json({ mensagem: `O registro de manutenção (ID: ${id}) foi deletado.` });

    } catch (error) {
      console.error("❌ Erro ao deletar manutenção:", error);
      res.status(500).json({ mensagem: "Erro interno ao deletar a manutenção." });
    }
  },
};

module.exports = manutencoesController;