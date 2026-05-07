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

        } catch (erro) {
            //Se der erro, avisa no terminal e manda uma mensagem amigável pro Front
            console.error("❌ Erro ao buscar equipamentos:", erro);
            res.status(500).json({ mensagem: "Erro interno ao buscar os equipamentos." });
        }
    },


    //Função de listar por id
    listarPorId: async (req, res) => {
        try{
            const {id} = req.params;

            //Usa a função de conectar ao banco!
            const db = await conectarBanco();

            // O banco busca os dados e guarda na variável 'equipamentos'
            const equipamentoEspecifico = await db.get(`SELECT * FROM equipamentos WHERE id = ?`, [id]);

            //Se busca não localizou registro 
            if (!equipamentoEspecifico) {
                // Colocamos o return para ele encerrar a função aqui e não tentar enviar o 200
                return res.status(404).json({ mensagem: "Equipamento não encontrado." });
            }

            //Se localizou o registro, entrega a variável respondendo com o formato JSON
            res.status(200).json(equipamentoEspecifico);

        } catch (erro) {
            // O catch fica só para erros graves do servidor
            console.error("❌ Erro ao buscar equipamento por ID:", erro);
            res.status(500).json({ mensagem: "Erro interno ao buscar o equipamento." });
        }
    }


    //Função de Criar novo registro


    //Função de Atualizar registro já existente


    //Função de Deletar registro

};

// Exporta o objeto inteiro
module.exports = equipamentosController;