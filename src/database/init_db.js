const sqlite3 = require('sqlite3');
const {open} = require('sqlite');
const path = require('path');


const criarBanco = async() => {
    // Abre ou cria a conexão com o banco de dados
    const db = await open({
        // __dirname garante que o arquivo db seja criado na mesma pasta deste script
        filename: path.join(__dirname, 'database.db'), 
        driver: sqlite3.Database,
    });

        //Criando tabela Beneficiarios
    await db.exec(`
        CREATE TABLE IF NOT EXISTS beneficiarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            documento TEXT,
            email TEXT,
            telefone TEXT,
            endereco TEXT,
            foto TEXT,             -- Aqui, receberá a imagem pela Biblioteca multer
            data_nascimento TEXT,
            data_cadastro TEXT
        
        );
        
    `);

        //Criando tabela Equipamentos
    await db.exec(`
        CREATE TABLE IF NOT EXISTS equipamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            descricao TEXT,
            categoria TEXT,
            numero_serie TEXT,
            status TEXT DEFAULT 'Disponível',
            data_aquisicao TEXT,
            observacoes TEXT
        
        );
    
    `);

        //Criando tabela Emprestimos (Relacionada com Beneficiarios e Equipamentos)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS emprestimos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            beneficiario_id INTEGER,
            equipamento_id INTEGER,
            data_inicio TEXT,
            data_fim TEXT,
            data_devolucao TEXT,
            status TEXT,
            observacoes TEXT,
            data_cadastro TEXT,
            FOREIGN KEY (beneficiario_id) REFERENCES beneficiarios(id),
            FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id)          
        
        );
        
    `);

    //Criando tabela Doacoes (Relacionada com Equipamentos)

    await db.exec(`
        CREATE TABLE IF NOT EXISTS doacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doador TEXT DEFAULT 'Anônimo',
            categoria TEXT NOT NULL, -- "Equipamento", "Alimento", "Vestuário", etc.
            item TEXT NOT NULL,      -- Ex: "Cadeira de Rodas", "Cesta Básica", "Agasalho"
            quantidade INTEGER DEFAULT 1,
            unidade_medida TEXT,     -- Ex: "un", "kg", "kits"
            data_doacao TEXT NOT NULL,
            observacoes TEXT
        );
        
    `);    

    //Criando tabela Tabela de Entregas (Tudo o que a ONG DOA para as famílias)

    await db.exec(`
        CREATE TABLE IF NOT EXISTS entregas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            beneficiario_id INTEGER NOT NULL,
            item TEXT NOT NULL,
            categoria TEXT NOT NULL,           -- "Alimento", "Vestuário", "Higiene"
            quantidade INTEGER DEFAULT 1,
            data_entrega TEXT NOT NULL,
            observacoes TEXT,
            FOREIGN KEY (beneficiario_id) REFERENCES beneficiarios(id)
        );


    `);
    


        //Criando tabela Manutencoes (Relacionada com Equipamentos)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS manutencoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipamento_id INTEGER,
            data_inicio TEXT,
            data_fim TEXT,
            tipo TEXT,
            descricao TEXT,
            custo REAL,
            responsavel TEXT,
            observacoes TEXT,
            status  TEXT,
            data_cadastro TEXT,
            FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id)
        );
    
    `);

    console.log('✅ Todas as tabelas foram criadas com sucesso!');

};

// Executa a função
criarBanco();