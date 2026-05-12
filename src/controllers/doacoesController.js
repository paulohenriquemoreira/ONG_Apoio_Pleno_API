//Conexão com o banco
const conectarBanco = require("../config/database");

const doacoesController = {

    //Função para listar todas doações
    listarTodos: async (req, res) => {
        try {
            
            const db = await conectarBanco();

            // O banco busca os dados e guarda na variável 'doacoes'
            const doacoes = await db.all(`SELECT * FROM doacoes`);

            //Entrega a variável respondendo com o formato JSON
            res.status(200).json(doacoes);
        } catch (error) {
            //Se der error, avisa no terminal e manda uma mensagem amigável pro Front
            console.error("❌ Erro ao buscar as doações :", error);
            res
                .status(500)
                .json({mensagem: "Erro interno ao buscar as doações."});
        }
    },

    //Função lista doação específica
    listarPorId: async (req, res) => {
        try {
            const {id} = req.params;

            //Conexão com banco
            const db = await conectarBanco();

            const doacoes = await db.get(`SELECT * FROM doacoes WHERE id = ?`, [id]);

            if(!doacoes){
                return res
                    .status(404)
                    .json({ mensagem: "Doação não encontrado." });
            }

           //Se localizou o registro, entrega a variável respondendo com o formato JSON
            res
                .status(200)
                .json(doacoes);  

        } catch (error) {

            // O catch fica só para erros graves do servidor
            console.error("❌ Erro ao buscar doação por ID:", error);
            
            res
                .status(500)
                .json({ mensagem: "Erro interno ao buscar o doação." });
        }
    },

    //Função cadastrar nova doação
    cadastrar: async (req, res) => {

        try {
            
            const {
                doador,
                categoria,
                item,
                quantidade,
                unidade_medida,
                observacoes}= req.body;

            //Regra do Doador: Se veio vazio, vira "Anônimo"
            const nomeDoador = doador ? doador : "Anônimo";

            // Regra do Tempo: Back-end gera a data da doação (Hoje)
            const dataHoje = new Date().toISOString().split('T')[0];
            
            //Usa a função de conectar ao banco!
            const db = await conectarBanco();


            const resultado = await db.run(`
                INSERT INTO doacoes (doador, categoria, item, quantidade, unidade_medida, data_doacao, observacoes)
                VALUES(?,?,?,?,?,?,?)`,
                [
                    nomeDoador,
                    categoria,
                    item,
                    quantidade,
                    unidade_medida,
                    dataHoje,
                    observacoes

                ]);

            // =============================================================================
            // A REGRA DE NEGÓCIO: Se o item doado for um equipamento, joga pro estoque!
            // =============================================================================
            if (categoria === "Equipamento") {
                await db.run(`
                    INSERT INTO equipamentos (nome, categoria, status, data_aquisicao, observacoes)
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        item, 
                        "Doação", 
                        "Disponível", // <-- Aqui garante que ele não entre como null
                        dataHoje, 
                        `Adicionado automaticamente via doação #${resultado.lastID}`
                    ]
                );
            }

                res .status(201).json({
                    mensagem: `Doador de ${item} registrada com sucesso! Doador: ${nomeDoador}`,
                    id_doacao: resultado.lastID, 
                                
                });
        } catch (error) {
            // O catch fica só para erros graves do servidor
            console.error("❌ Erro ao registrar doação:", error);
            res
                .status(500)
                .json({mensagem: "Erro interno no servidor." });
        }

    },

};

// Exporta o objeto inteiro
module.exports = doacoesController;

