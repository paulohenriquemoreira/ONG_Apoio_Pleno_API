// Conexão com o banco de dados
const conectarBanco = require("../config/database");

const dashboardController = {

    // Função única que busca os totais de várias tabelas simultaneamente
    obterResumo: async (req, res) => {
        try {
            const db = await conectarBanco();

            // ==========================================
            // 1. KPIs PRINCIPAIS (Contagens)
            // ==========================================
            const familias = await db.get(`
                SELECT COUNT(id) AS total FROM beneficiarios
            `);

            const equipamentosEmUso = await db.get(`
                SELECT COUNT(id) AS total FROM equipamentos WHERE status = 'Emprestado'
            `);

            const estoqueDisponivel = await db.get(`
                SELECT COUNT(id) AS total FROM equipamentos WHERE status = 'Disponível'
            `);

            const emManutencao = await db.get(`
                SELECT COUNT(id) AS total FROM equipamentos WHERE status = 'Em Manutenção'
            `);


            // ==========================================
            // 2. SUPRIMENTOS: CESTAS BÁSICAS (Somas)
            // ==========================================
            // ENTRADAS (Tabela de Doações)
            const cestasRecebidas = await db.get(`
                SELECT SUM(quantidade) AS total FROM doacoes WHERE categoria = 'Cesta Básica'
            `);

            // SAÍDAS (Tabela de Entregas)
            const cestasDoadas = await db.get(`
                SELECT SUM(quantidade) AS total FROM entregas WHERE categoria = 'Cesta Básica'
            `);


            // ==========================================
            // 3. SUPRIMENTOS: ROUPAS (Somas)
            // ==========================================
            // ENTRADAS (Tabela de Doações)
            const roupasRecebidas = await db.get(`
                SELECT SUM(quantidade) AS total FROM doacoes WHERE categoria = 'Roupas'
            `);

            // SAÍDAS (Tabela de Entregas)
            const roupasDoadas = await db.get(`
                SELECT SUM(quantidade) AS total FROM entregas WHERE categoria = 'Roupas'
            `);


            // ==========================================
            // 4. MONTAGEM DO PACOTE JSON PARA O FRONT-END
            // ==========================================
            const resumoDashboard = {
                kpis: {
                    // O '|| 0' garante que não retorne null se a tabela estiver vazia
                    familias: familias.total || 0, 
                    equipamentos_uso: equipamentosEmUso.total || 0,
                    estoque_disponivel: estoqueDisponivel.total || 0,
                    manutencao: emManutencao.total || 0
                },
                suprimentos: {
                    cestas: {
                        recebidas: cestasRecebidas.total || 0,
                        doadas: cestasDoadas.total || 0
                    },
                    roupas: {
                        recebidas: roupasRecebidas.total || 0,
                        doadas: roupasDoadas.total || 0
                    }
                }
            };

            // Entrega o objeto formatado com status 200 (Sucesso)
            res.status(200).json(resumoDashboard);

        } catch (error) {
            console.error("❌ Erro ao gerar resumo do Dashboard:", error);
            res.status(500).json({ mensagem: "Erro interno ao processar os dados do Dashboard." });
        }
    }

};

// Exporta o controlador
module.exports = dashboardController;