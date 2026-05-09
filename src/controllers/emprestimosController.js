
const conectarBanco = require("../config/database");

const emprestimosController = {
    //Função para listar todos os emprestimos.
    listarTodos: async (req, res) => {
        try {

            // Usa a função pronta para conectar ao banco!
            const db = await conectarBanco();

            // O banco busca os dados e guarda na variável 'emprestimo'
            const emprestimo = await db.all(`SELECT * FROM emprestimos`);

            //Entrega a variável respondendo com o formato JSON
            res.status(200).json(emprestimo);            
        } catch (error) {
            //Se der error, avisa no terminal e manda uma mensagem amigável pro Front
            console.error("❌ Erro ao buscar equipamento emprestado :", error);
            res
                .status(500)
                .json({ mensagem: "Erro interno ao buscar os equipamento emprestado."});            
        }
    },

    //Função para listar emprestimo especifico.
    listarPorId: async (req, res) => {
        try {
            const {id} = req.params;

            // Usa a função pronta para conectar ao banco!
            const db = await conectarBanco();

            const emprestimoEspecifico = await db.get(`
                SELECT * FROM emprestimos WHERE id = ?`, [id]);

            //Se busca não localizou registro
            if(!emprestimoEspecifico){
                return res
                    .status(404)
                    .json({ mensagem: "Equipamento emprestado não encontrado." });
            }

           //Se localizou o registro, entrega a variável respondendo com o formato JSON
            res
                .status(200)
                .json(emprestimoEspecifico);            
        } catch (error) {
            // O catch fica só para erros graves do servidor
            console.error("❌ Erro ao buscar equipamento emprestado por ID:", error);
            res
                .status(500)
                .json({ mensagem: "Erro interno ao buscar o equipamento emprestado." });
        }
    },


    //Função para cadastrar novo emprestimo de equipamento.
    cadastrar: async (req, res) => {
        try {
        // 1. O Front-end só precisa mandar QUEM pegou, O QUE pegou, e se tem alguma observação.
        const { beneficiario_id, equipamento_id, observacoes } = req.body;

        const db = await conectarBanco();

        // ==================================================================
        // REGRA DE NEGÓCIO 1: O equipamento está realmente disponível?
        // ==================================================================
        const equipamento = await db.get(
            `SELECT status FROM equipamentos WHERE id = ?`, 
            [equipamento_id]
        );

        // Se o equipamento não existir ou não estiver "Disponível", bloqueamos a operação!
        if (!equipamento) {
            return res.status(404).json({ mensagem: "Equipamento não encontrado." });
        }
        if (equipamento.status !== "Disponível") {
            return res.status(400).json({ 
                mensagem: `Empréstimo negado. O equipamento atualmente está: ${equipamento.status}` 
            });
        }

        // ==================================================================
        // REGRA DE NEGÓCIO 2: O Back-end controla o Tempo (Regra dos 30 dias)
        // ==================================================================
        const dataHoje = new Date();
        const data_inicio = dataHoje.toISOString().split('T')[0]; // Ex: 2026-05-08
        const data_cadastro = data_inicio; // Aproveita a mesma data para o cadastro

        // Cria uma nova data, soma 30 dias a ela e formata para YYYY-MM-DD
        const dataLimite = new Date(dataHoje);
        dataLimite.setDate(dataLimite.getDate() + 30);
        const data_fim = dataLimite.toISOString().split('T')[0]; 

        // O status inicial do empréstimo será "Ativo"
        const statusEmprestimo = "Ativo";
        const data_devolucao = null; // Ainda não devolveu, então fica vazio (nulo)

        // ==================================================================
        // EXECUÇÃO NO BANCO DE DADOS (O Casamento das Tabelas)
        // ==================================================================
        
        // A. Salva o Empréstimo
        const resultado = await db.run(
            `INSERT INTO emprestimos (beneficiario_id, equipamento_id, data_inicio, data_fim, data_devolucao, status, observacoes, data_cadastro) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                beneficiario_id, 
                equipamento_id, 
                data_inicio, 
                data_fim, 
                data_devolucao, 
                statusEmprestimo, 
                observacoes, 
                data_cadastro
            ]
        );

        // B. Atualiza o Equipamento para que ninguém mais pegue!
        await db.run(
            `UPDATE equipamentos SET status = 'Emprestado' WHERE id = ?`, 
            [equipamento_id]
        );

        res.status(201).json({
            mensagem: "Empréstimo realizado com sucesso! O status do equipamento foi atualizado para 'Emprestado'.",
            emprestimo_id: resultado.lastID,
            data_devolucao_prevista: data_fim
        });

        } catch (error) {
        console.error("❌ Erro ao registrar empréstimo:", error);
        res.status(500).json({ mensagem: "Erro interno ao processar o empréstimo." });
        }
    },

    //Função para atualizar emprestimos de equipamentos
    atualizar: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, data_fim, observacoes } = req.body;

            const db = await conectarBanco();

            //Precisa buscar o empréstimo antes para saber qual é o equipamento e as datas antigas
            const emprestimoAtual = await db.get(`SELECT * FROM emprestimos WHERE id = ?`, [id]);
            
            if (!emprestimoAtual) {
                return res.status(404).json({ mensagem: "Equipamento emprestado não encontrado." });
            }

            // A "Regra Mágica" da Devolução
            let data_devolucao_final = emprestimoAtual.data_devolucao; 

            if (status === "Concluído" && emprestimoAtual.status !== "Concluído") {
                // Pega a data de hoje para carimbar a devolução
                const dataHoje = new Date();
                data_devolucao_final = dataHoje.toISOString().split('T')[0];

                // Vai lá na tabela de equipamentos e libera ele para a próxima pessoa!
                await db.run(`UPDATE equipamentos SET status = 'Disponível' WHERE id = ?`, [emprestimoAtual.equipamento_id]);
            }

            
            const resultado = await db.run(
                `UPDATE emprestimos SET status=?, data_fim=?, observacoes=?, data_devolucao=? WHERE id=?`,
                [
                    status,
                    data_fim, // Se for renovação, altera a data fim
                    observacoes,
                    data_devolucao_final,
                    id
                ]
            );

            res.status(200).json({
            
                mensagem: `Empréstimo ${id} atualizado com sucesso!`, 
            });

        } catch (error) {
            console.error("❌ Erro ao atualizar empréstimo por ID:", error);
            res.status(500).json({ mensagem: "Erro interno ao atualizar o empréstimo." });
        }
    },

    //Função para deletar emprestimos de equipamentos
    deletar: async (req, res) => {
        try {
            const { id } = req.params;
            const db = await conectarBanco();

            //Busca o empréstimo para saber se existe (e pegar o ID do equipamento)
            const emprestimo = await db.get(`SELECT * FROM emprestimos WHERE id = ?`, [id]);

            if (!emprestimo) {
                return res.status(404).json({
                    mensagem: `O empréstimo de ID ${id} não foi encontrado para exclusão.`,
                });
            }

            // Se o empréstimo não estava concluído, precisa "soltar" o equipamento primeiro!
            if (emprestimo.status !== 'Concluído') {
                 await db.run(`UPDATE equipamentos SET status = 'Disponível' WHERE id = ?`, [emprestimo.equipamento_id]);
            }

            // O DELETE na tabela emprestimos
            await db.run(`DELETE FROM emprestimos WHERE id = ?`, [id]);

            res.status(200).json({
                mensagem: `O registro de empréstimo (ID: ${id}) foi deletado. O equipamento foi liberado.`,
            });

        } catch (error) {
            console.error("❌ Erro ao deletar empréstimo por ID:", error);
            res.status(500).json({ mensagem: "Erro interno ao deletar o empréstimo." });   
        }
    }
};

module.exports = emprestimosController;