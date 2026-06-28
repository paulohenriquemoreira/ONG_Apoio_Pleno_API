//Importa APENAS a ponte mágica (o arquivo da pasta config)
const conectarBanco = require("../config/database");

// Cria um objeto para guardar as funções
const equipamentosController = {
  // Função de listar
  listarTodos: async (req, res) => {
    try {
      // Usa a função pronta para conectar ao banco!
      const db = await conectarBanco();

      // O banco busca os dados e guarda na variável 'equipamentos'
      const equipamentos = await db.all(`
          SELECT *
          FROM equipamentos        
      `);

      //Entrega a variável respondendo com o formato JSON
      res.status(200).json(equipamentos);
    } catch (error) {
      //Se der error, avisa no terminal e manda uma mensagem amigável pro Front
      console.error("❌ Erro ao buscar equipamentos:", error);
      res
        .status(500)
        .json({ mensagem: "Erro interno ao buscar os equipamentos." });
    }
  },

  //Função de listar por id
  listarPorId: async (req, res) => {
    try {
      //Receber o ID do item selecionado
      const { id } = req.params;

      //Usa a função de conectar ao banco!
      const db = await conectarBanco();

      // O banco busca os dados e guarda na variável 'equipamentos'
      const equipamentoEspecifico = await db.get(
        `SELECT * FROM equipamentos WHERE id = ?`,
        [id],
      );

      //Se busca não localizou registro
      if (!equipamentoEspecifico) {
        // O return serve para ele encerrar a função aqui e não tentar enviar o 200
        return res
          .status(404)
          .json({ mensagem: "Equipamento não encontrado." });
      }

      //Se localizou o registro, entrega a variável respondendo com o formato JSON
      res.status(200).json(equipamentoEspecifico);
    } catch (error) {
      // O catch fica só para erros graves do servidor
      console.error("❌ Erro ao buscar equipamento por ID:", error);
      res
        .status(500)
        .json({ mensagem: "Erro interno ao buscar o equipamento." });
    }
  },

  //Função de Criar novo registro
  cadastrar: async (req, res) => {
    try {
      const {
        nome,
        descricao,
        categoria,
        numero_serie,
        status, // O front PODE mandar o status (ex: "Em manutenção")
        data_aquisicao,
        observacoes,
      } = req.body;

      //Se o Front-end NÃO mandar status nenhum, será forçado o padrão!
      const statusDefinitivo = status ? status : "Disponível";

      //Usa a função de conectar ao banco!
      const db = await conectarBanco();

      const resultado = await db.run(
        `INSERT INTO equipamentos(nome, descricao,categoria,numero_serie,status, data_aquisicao, observacoes)VALUES(?,?,?,?,?,?,?)`,
        [
          nome,
          descricao,
          categoria,
          numero_serie,
          statusDefinitivo,
          data_aquisicao,
          observacoes,
        ],
      );
      res.status(201).json({
        mensagem: `Equipamento ${nome} registrado com sucesso!`,
        id: resultado.lastID,
      });
    } catch (error) {
      // O catch fica só para erros graves do servidor
      console.error("❌ Erro ao registrar equipamento:", error);
      res.status(500).json({ mensagem: "Erro interno no servidor." });
    }
  },

  // Função de Atualizar registro já existente
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nome,
        descricao,
        categoria,
        numero_serie,
        status,
        data_aquisicao,
        observacoes,
      } = req.body;

      // Usa a função de conectar ao banco!
      const db = await conectarBanco();

      const resultado = await db.run(
        `
            UPDATE equipamentos SET nome=?, descricao=?, categoria=?, numero_serie=?, status=?, data_aquisicao=?, observacoes=? WHERE id = ?`,
        [
          nome,
          descricao,
          categoria,
          numero_serie,
          status,
          data_aquisicao,
          observacoes,
          id,
        ],
      );

      // Verifica se alguma linha foi realmente alterada
      if (resultado.changes === 0) {
        return res
          .status(404)
          .json({ mensagem: "Equipamento não encontrado." });
      }

      res.status(200).json({
        mensagem: `Dados do equipamento ${nome} atualizados com sucesso!`,
      });
    } catch (error) {
      // O catch fica só para erros graves do servidor
      console.error("❌ Erro ao atualizar equipamento por ID:", error);
      res
        .status(500)
        .json({ mensagem: "Erro interno ao atualizar o equipamento." });
    }
  },

  //Função de Deletar registro
  deletar: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();

      // 1. Verifica se existe
      const equipamento = await db.get(
        `SELECT nome, status FROM equipamentos WHERE id = ?`,
        [id],
      );
      if (!equipamento)
        return res.status(404).json({ mensagem: "Não encontrado." });

      // 2. Regra de bloqueio (se não quiser que deletem equipamentos ainda emprestados)
      if (equipamento.status !== "Disponível") {
        return res
          .status(400)
          .json({
            mensagem: "Alterar status para Disponível antes de excluir.",
          });
      }

      // 3. LIMPEZA MANUAL DAS TABELAS VINCULADAS
      // Isso evita o erro 500, pois remove as referências antes de deletar o pai
      await db.run(`DELETE FROM manutencoes WHERE equipamento_id = ?`, [id]);
      await db.run(`DELETE FROM emprestimos WHERE equipamento_id = ?`, [id]);

      // 4. Agora sim, deleta o equipamento
      await db.run(`DELETE FROM equipamentos WHERE id = ?`, [id]);

      res.status(200).json({ mensagem: "Equipamento removido com sucesso!" });
    } catch (error) {
      console.error("❌ Erro no Back-end:", error);
      res
        .status(500)
        .json({
          mensagem: "Erro ao remover. Verifique se não há outros vínculos.",
        });
    }
  },
};

// Exporta o objeto inteiro
module.exports = equipamentosController;
