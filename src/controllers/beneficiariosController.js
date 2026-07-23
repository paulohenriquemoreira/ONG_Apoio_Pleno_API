const fs = require("fs");
const path = require("path");

// Estabelece a conexão centralizada com o banco de dados da aplicação.
const conectarBanco = require("../config/database");

const beneficiariosController = {
  // Retorna a listagem completa de beneficiários armazenados no sistema.
  listarTodos: async (req, res) => {
    try {
      const db = await conectarBanco();
      const beneficiarios = await db.all(`SELECT * FROM beneficiarios`);

      res.status(200).json(beneficiarios);
    } catch (error) {
      console.log("❌ Erro ao buscar beneficiários:", error);
      res
        .status(500)
        .json({ mensagem: "Erro interno ao buscar os beneficiários." });
    }
  },

  // Consulta e devolve um beneficiário específico baseado no ID informado.
  listarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();

      const beneficiarioEspecifico = await db.get(
        `SELECT * FROM beneficiarios WHERE id = ?`,
        [id],
      );

      if (!beneficiarioEspecifico) {
        return res
          .status(404)
          .json({ mensagem: "Beneficiário não encontrado." });
      }

      res.status(200).json(beneficiarioEspecifico);
    } catch (error) {
      console.error("❌ Erro ao buscar beneficiário por ID:", error);
      res
        .status(500)
        .json({ mensagem: "Erro interno ao buscar o beneficiário." });
    }
  },

  // Registra um novo beneficiário, anexando sua respectiva foto caso seja fornecida.
  cadastrar: async (req, res) => {
    try {
      const { nome, documento, email, telefone, endereco, data_nascimento } =
        req.body;

      // Gera a data atual diretamente pelo servidor para garantir consistência temporal.
      const dataHoje = new Date();
      const data_cadastro = dataHoje.toISOString().split("T")[0];

      const db = await conectarBanco();

      // Extrai o nome do arquivo gerado pelo middleware Multer, assumindo nulo se inexistente.
      const nomeDaFoto = req.file ? req.file.filename : null;

      const resultado = await db.run(
        `
            INSERT INTO beneficiarios (nome, documento, email, telefone, endereco, foto, data_nascimento, data_cadastro)
            VALUES(?,?,?,?,?,?,?,?)`,
        [
          nome,
          documento,
          email,
          telefone,
          endereco,
          nomeDaFoto,
          data_nascimento,
          data_cadastro,
        ],
      );

      res.status(201).json({
        mensagem: `Beneficiário ${nome} registrado com sucesso!`,
        id: resultado.lastID,
      });
    } catch (error) {
      console.error("❌ Erro ao registrar beneficiário:", error);
      res.status(500).json({ mensagem: "Erro interno no servidor." });
    }
  },

  // Atualiza os dados de um beneficiário existente e substitui a foto antiga se uma nova for enviada.
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nome,
        documento,
        email,
        telefone,
        endereco,
        data_nascimento,
        data_cadastro,
      } = req.body;
      const db = await conectarBanco();

      const beneficiarioAntigo = await db.get(
        `SELECT * FROM beneficiarios WHERE id = ?`,
        [id],
      );

      if (!beneficiarioAntigo) {
        return res
          .status(404)
          .json({ mensagem: "Beneficiário não encontrado." });
      }

      let nomeDaFoto = beneficiarioAntigo.foto;

      if (req.file) {
        nomeDaFoto = req.file.filename;
        if (beneficiarioAntigo.foto) {
          const caminhoFotoAntiga = path.join(
            __dirname,
            "../../public/uploads",
            beneficiarioAntigo.foto,
          );
          if (fs.existsSync(caminhoFotoAntiga))
            fs.unlinkSync(caminhoFotoAntiga);
        }
      }

      await db.run(
        `UPDATE beneficiarios SET nome=?, documento=?, email=?, telefone=?, endereco=?, foto=?, data_nascimento=?, data_cadastro=? WHERE id = ?`,
        [
          nome || beneficiarioAntigo.nome,
          documento || beneficiarioAntigo.documento,
          email || beneficiarioAntigo.email,
          telefone || beneficiarioAntigo.telefone,
          endereco || beneficiarioAntigo.endereco,
          nomeDaFoto,
          data_nascimento || beneficiarioAntigo.data_nascimento,
          data_cadastro || beneficiarioAntigo.data_cadastro,
          id,
        ],
      );

      res.status(200).json({ mensagem: "Atualizado com sucesso!" });
    } catch (error) {
      console.error("❌ Erro:", error);
      res.status(500).json({ mensagem: "Erro interno no servidor." });
    }
  },

  // Exclui permanentemente o registro de um beneficiário, limpando as chaves estrangeiras e a foto com segurança.
  deletar: async (req, res) => {
    try {
      const { id } = req.params;
      const db = await conectarBanco();

      // Busca as informações prévias para mapear o arquivo físico anexado ao perfil.
      const beneficiario = await db.get(
        `SELECT * FROM beneficiarios WHERE id = ?`,
        [id],
      );

      if (!beneficiario) {
        return res.status(404).json({
          mensagem: `O beneficiário de ID ${id} não foi encontrado para exclusão.`,
        });
      }

      // Inicia a transação e desativa temporariamente as restrições de foreign key para garantir a limpeza completa
      await db.run(`BEGIN TRANSACTION`);
      await db.run(`PRAGMA foreign_keys = OFF`);

      // Remove os registros vinculados nas tabelas filhas liberando os equipamentos e dependências
      await db.run(`DELETE FROM emprestimos WHERE beneficiario_id = ?`, [id]);
      await db.run(`DELETE FROM entregas WHERE beneficiario_id = ?`, [id]);

      // Remove o registro principal do beneficiário
      await db.run(`DELETE FROM beneficiarios WHERE id = ?`, [id]);

      // Reativa as chaves estrangeiras e confirma a transação
      await db.run(`PRAGMA foreign_keys = ON`);
      await db.run(`COMMIT`);

      // Remove a foto do disco rígido somente após a transação ser concluída com sucesso no banco
      if (beneficiario.foto) {
        const caminhoFoto = path.join(
          __dirname,
          "../../public/uploads",
          beneficiario.foto,
        );
        try {
          if (fs.existsSync(caminhoFoto)) {
            fs.unlinkSync(caminhoFoto);
          }
        } catch (errFoto) {
          console.error(
            "Aviso: Registro deletado, mas a foto antiga não pôde ser apagada do disco.",
            errFoto,
          );
        }
      }

      res.status(200).json({
        mensagem: `O beneficiário "${beneficiario.nome}" e seus vínculos foram deletados com sucesso!`,
      });
    } catch (error) {
      // Em caso de qualquer falha, desfaz a transação para preservar a integridade do banco de dados
      try {
        const db = await conectarBanco();
        await db.run(`ROLLBACK`);
        await db.run(`PRAGMA foreign_keys = ON`);
      } catch (rollbackErr) {
        console.error("Erro no rollback:", rollbackErr);
      }

      console.error("❌ Erro ao deletar beneficiário por ID:", error);
      res
        .status(500)
        .json({
          mensagem: "Erro interno ao deletar o beneficiário e seus vínculos.",
        });
    }
  },
};

module.exports = beneficiariosController;
