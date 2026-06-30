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

      // Resgata os dados antigos para evitar sobrescrever colunas com valores nulos indevidamente.
      const beneficiarioAntigo = await db.get(
        `SELECT * FROM beneficiarios WHERE id = ?`,
        [id],
      );

      // Bloqueia a execução caso o registro alvo não exista no banco.
      if (!beneficiarioAntigo) {
        return res
          .status(404)
          .json({ mensagem: "Beneficiário não encontrado para atualização." });
      }

      let nomeDaFoto;

      // Define a manipulação do arquivo: substitui e exclui a foto antiga ou mantém a atual.
      if (req.file) {
        nomeDaFoto = req.file.filename;

        if (beneficiarioAntigo.foto) {
          const caminhoFotoAntiga = path.join(
            __dirname,
            "../../public/uploads",
            beneficiarioAntigo.foto,
          );

          try {
            if (fs.existsSync(caminhoFotoAntiga)) {
              fs.unlinkSync(caminhoFotoAntiga);
            }
          } catch (errFoto) {
            console.error(
              "Aviso: Falha ao deletar a foto antiga, prosseguindo com a edição.",
              errFoto,
            );
          }
        }
      } else {
        nomeDaFoto = beneficiarioAntigo.foto;
      }

      // Preenche eventuais lacunas da requisição utilizando os dados pré-existentes do usuário.
      const nomeFinal = nome || beneficiarioAntigo.nome;
      const documentoFinal = documento || beneficiarioAntigo.documento;
      const emailFinal = email || beneficiarioAntigo.email;
      const telefoneFinal = telefone || beneficiarioAntigo.telefone;
      const enderecoFinal = endereco || beneficiarioAntigo.endereco;
      const nascimentoFinal =
        data_nascimento || beneficiarioAntigo.data_nascimento;
      const cadastroFinal = data_cadastro || beneficiarioAntigo.data_cadastro;

      // Executa a instrução de atualização no banco de dados com os valores unificados.
      const resultado = await db.run(
        `UPDATE beneficiarios SET nome=?, documento=?, email=?, telefone=?, endereco=?, foto=?, data_nascimento=?, data_cadastro=? WHERE id = ?`,
        [
          nomeFinal,
          documentoFinal,
          emailFinal,
          telefoneFinal,
          enderecoFinal,
          nomeDaFoto,
          nascimentoFinal,
          cadastroFinal,
          id,
        ],
      );

      if (resultado.changes === 0) {
        return res
          .status(400)
          .json({ mensagem: "Nenhuma alteração foi realizada." });
      }

      res.status(200).json({
        mensagem: `Dados do beneficiário atualizados com sucesso!`,
      });
    } catch (error) {
      console.error("❌ Erro ao atualizar beneficiário por ID:", error);
      res
        .status(500)
        .json({ mensagem: "Erro interno ao atualizar o beneficiário." });
    }
  },

  // Exclui permanentemente o registro de um beneficiário e seu respectivo arquivo de foto.
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

      // Procede com a tentativa de exclusão direta na tabela principal.
      await db.run(`DELETE FROM beneficiarios WHERE id = ?`, [id]);

      // Remove a foto do disco rígido somente se o registro for excluído com sucesso do banco.
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
        mensagem: `O beneficiário "${beneficiario.nome}" foi deletado com sucesso!`,
      });
    } catch (error) {
      console.error("❌ Erro ao deletar beneficiário por ID:", error);

      // Captura a restrição estrutural de chave estrangeira comunicando o bloqueio de forma legível.
      if (error.message && error.message.includes("FOREIGN KEY")) {
        return res.status(400).json({
          mensagem:
            "Bloqueado: Este beneficiário possui empréstimos ou entregas e não pode ser excluído diretamente.",
        });
      }

      res
        .status(500)
        .json({ mensagem: "Erro interno ao deletar o beneficiário." });
    }
  },
};

module.exports = beneficiariosController;
