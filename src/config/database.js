const sqlite3 = require('sqlite3');
const {open} = require('sqlite');
const path = require('path');

//Função que abre a conexão com o banco de dados.
//Ela será exportada para que os Controllers possam usá-la.

const conectarBanco = async () => {

    try{
        const db = await open({
            //Caminho voltando uma etapa para chegar em src/database/database.db
            filename: path.join(__dirname, '../database/database.db'),
            driver: sqlite3.Database
        });

      //Ativa o suporte a Chaves Estrangeiras no SQLite.
        await db.get("PRAGMA foreign_keys = ON");

        return db;
    } catch (erro) {
        console.error("❌ Erro ao conectar com o banco de dados:", erro);
        throw erro;
    }

};

module.exports = conectarBanco;