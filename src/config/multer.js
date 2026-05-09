const multer = require('multer');
const path = require('path');

// Configuração de onde e como o arquivo será salvo
const storage = multer.diskStorage({
    // Destino: Pasta public/uploads
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    // Nome do arquivo: Vai colocar a data atual na frente para nunca ter nomes repetidos (ex: 171518293-foto-joao.png)
    filename: function (req, file, cb) {
        const nomeUnico = Date.now() + '-' + file.originalname;
        cb(null, nomeUnico);
    }
});

// Criado o "estoquista" (middleware) com essa configuração
const upload = multer({ storage: storage });

module.exports = upload;