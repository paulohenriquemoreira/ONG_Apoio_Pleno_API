const express = require("express");
const path = require("path");

//Importação das rotas
const equipamentosRoutes = require("./routes/equipamentos.routes");
const beneficiariosRoutes = require("./routes/beneficiarios.routes");
const emprestimosRoutes = require("./routes/emprestimos.routes");



const app = express();

// Permite que a API receba dados no formato JSON
app.use(express.json());

// Servindo arquivos estáticos da pasta public (para a logo funcionar)
app.use(express.static(path.join(__dirname, "../public")));

//Ligação das Rotas
app.use("/api/equipamentos", equipamentosRoutes);
app.use("/api/beneficiarios", beneficiariosRoutes);
app.use("/api/emprestimos", emprestimosRoutes);

// Rota Principal (Página de boas-vindas)
app.get("/", (req, res) => {
  res.send(`
        <body style="font-family: Arial; padding: 30px; background-color: #f5f7fa; color: #333;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <img 
                    src="/LogoApoioPleno.png" 
                    alt="Logo ONG Apoio Pleno"
                    style="width: 100px; height: 100px; object-fit: contain;"
                />
                <h1 style="color: #2c3e50; margin: 0;">ONG Apoio Pleno</h1>
            </div>

            <h3 style="color:#34495e;">Sistema de Gestão Solidária</h3>

            <h6 style="font-size: 15px; line-height: 1.6; max-width: 900px;">
                A instituição tem como missão primária o atendimento a pessoas 
                em situação de vulnerabilidade socioeconômica, atuando fortemente 
                como um Banco de Empréstimo Solidário de equipamentos médicos e 
                ortopédicos, além de gerenciar a arrecadação e distribuição de 
                doações de mantimentos e equipamentos.
            </h6>

            <p style="line-height: 1.8; max-width: 900px;">
                O objetivo principal da aplicação é digitalizar, contabilizar e 
                monitorar os processos operacionais da organização, fornecendo 
                controle rigoroso sobre o estoque, rastreabilidade de empréstimos, 
                gestão de manutenções e o acompanhamento humanizado dos pacientes.
            </p>

            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 500px;">
                <h3 style="margin-top: 0;">📌 Endpoints da API disponíveis</h3>
                <ul style="line-height: 2; font-family: monospace; font-size: 14px;">
                    <li>GET, POST, PUT, DELETE - <b>/api/beneficiarios</b></li>
                    <li>GET, POST, PUT, DELETE - <b>/api/doacoes</b></li>
                    <li>GET, POST, PUT, DELETE - <b>/api/emprestimos</b></li>
                    <li>GET, POST, PUT, DELETE - <b>/api/equipamentos</b></li>
                    <li>GET, POST, PUT, DELETE - <b>/api/manutencoes</b></li>
                </ul>
            </div>
        </body>    
    `);
});

// Define a porta (pega do .env se existir, ou usa a 3000 por padrão)
const PORT = process.env.PORT || 3000;
// "Ligando" o servidor na porta especificada
app.listen(PORT, () => {
    console.log(`🚀 Servidor da ONG Apoio Pleno rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});