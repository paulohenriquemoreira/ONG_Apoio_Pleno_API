
const fs = require("fs");
const path = require("path");
// Importa a função de conectar ao banco
const conectarBanco = require("../config/database");

const beneficiariosController = {
  // Função para listar todos os beneficiários
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

  // Função para listar beneficiários por ID
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

  // Função de Criar novo registro (Com foto!)
  cadastrar: async (req, res) => {
    try {
      const {
        nome,
        documento,
        email,
        telefone,
        endereco,
        data_nascimento,
      } = req.body;

      // Isso pega a data de hoje diretamente do servidor!
      const dataHoje = new Date();
      const data_cadastro = dataHoje.toISOString().split('T')[0];

      const db = await conectarBanco();

      // Se o usuário não enviou foto, req.file será undefined.
      // Se enviou, pega apenas o nome do arquivo gerado pelo Multer.
      const nomeDaFoto = req.file ? req.file.filename : null;

      // O nome da coluna no banco é apenas 'foto'
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
          nomeDaFoto, // A variável com o nome da foto entra aqui, na mesma ordem
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
// Função de Atualizar (Com foto!)

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
      
      
      // 1. Lógica inteligente para a foto
      let nomeDaFoto;

      const beneficiarioAntigo = await db.get(
        `SELECT foto FROM beneficiarios WHERE id = ?`,
        [id]
      );

      if (req.file) {
        // Se mandou arquivo novo, a variável assume o nome novo
        nomeDaFoto = req.file.filename;

        // O LIXEIRO AUTOMÁTICO: Se ele já tinha uma foto antes, será apagar do HD!
        if (beneficiarioAntigo && beneficiarioAntigo.foto) {
          // Monta o caminho exato de onde a foto antiga está salva na máquina
          const caminhoFotoAntiga = path.join(__dirname, "../../public/uploads", beneficiarioAntigo.foto);
          
          // Verifica se o arquivo físico realmente existe lá antes de tentar deletar
          if (fs.existsSync(caminhoFotoAntiga)) {
            fs.unlinkSync(caminhoFotoAntiga); // 💥 Destrói o arquivo antigo!
          }
        }
      } else {
        // Se não mandou arquivo novo, mantém a foto que já estava lá
        nomeDaFoto = beneficiarioAntigo ? beneficiarioAntigo.foto : null;
      };


      // 2. Agora sim, roda o UPDATE com a variável 'nomeDaFoto' decidida
      const resultado = await db.run(
        `UPDATE beneficiarios SET nome=?, documento=?, email=?, telefone=?, endereco=?, foto=?, data_nascimento=?, data_cadastro=? WHERE id = ?`,
        [
          nome,
          documento,
          email,
          telefone,
          endereco,
          nomeDaFoto,
          data_nascimento,
          data_cadastro,
          id,
        ]
      );

      // Verifica se alguma linha foi realmente alterada
      if (resultado.changes === 0) {
        return res
          .status(404)
          .json({ mensagem: "Beneficiário não encontrado para atualização." });
      }

      res.status(200).json({
        mensagem: `Dados do beneficiário ${nome} atualizados com sucesso!`,
      });

    } catch (error) {
      console.error("❌ Erro ao atualizar beneficiário por ID:", error);
      res
        .status(500)
        .json({ mensagem: "Erro interno ao atualizar o beneficiário." });
    }
  },

  // Função de deletar registro

deletar: async (req, res) => {
    try {
      const { id } = req.params;

      // Usar a função de conectar ao banco!
      const db = await conectarBanco();

      // Busca o beneficiário antes de deletar para saber o nome dele e pegar a foto
      const beneficiario = await db.get(
        `SELECT * FROM beneficiarios WHERE id = ?`,
        [id],
      );

      // Se a busca voltou vazia, ele nem tenta deletar
      if (!beneficiario) {
        return res
          .status(404) // 404 é o código correto para "Não encontrado"
          .json({
            mensagem: `O beneficiário de ID ${id} não foi encontrado para exclusão.`,
          });
      }

      // ==================================================================
      // O LIXEIRO AUTOMÁTICO: Destruindo a foto do usuário do HD
      // ==================================================================
      if (beneficiario.foto) {
        // Monta o caminho exato onde a foto está salva
        const caminhoFoto = path.join(__dirname, "../../public/uploads", beneficiario.foto);
        
        // Verifica se o arquivo realmente existe na pasta antes de deletar
        if (fs.existsSync(caminhoFoto)) {
          fs.unlinkSync(caminhoFoto); // 💥 Exclui o arquivo físico!
        }
      }

      // Caso exista, será deletado do banco de dados
      await db.run(`DELETE FROM beneficiarios WHERE id = ?`, [id]);

      res.status(200).json({
        mensagem: `O beneficiário "${beneficiario.nome}" e sua foto foram deletados com sucesso!`,
      });

    } catch (error) {
      // O catch fica só para erros graves do servidor
      console.error("❌ Erro ao deletar beneficiário por ID:", error);
      res
        .status(500)
        .json({ mensagem: "Erro interno ao deletar o beneficiário." });
    }
  },


};

module.exports = beneficiariosController;
