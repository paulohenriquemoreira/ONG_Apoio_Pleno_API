const multer = require("multer");
const path = require("path");

// 💾 1. CONFIGURAÇÃO DE ARMAZENAMENTO (Onde e como salvar)
const storage = multer.diskStorage({
  // Caminho aqui para apontar para dentro de public 👇
  destination: (req, file, cb) => {
    cb(null, "public/upload/");
  },
  filename: (req, file, cb) => {
    const sufixoUnico = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const extensao = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + sufixoUnico + extensao);
  }
});

// 🛡️ 2. A REGRA DE OURO DAS EXTENSÕES (Filtro de segurança)
const fileFilter = (req, file, cb) => {
  const extensoesPermitidas = /jpeg|jpg|png|tiff|jfif|webp/i;
  
  // Verifica a extensão do arquivo
  const extname = extensoesPermitidas.test(path.extname(file.originalname));
  
  // Mostra no terminal do seu servidor o que está tentando entrar
  console.log(`Tentando subir: ${file.originalname} | Mimetype interno: ${file.mimetype}`);
  
  // Verifica se o arquivo é realmente uma imagem
  const isImage = file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream';

  if (extname && isImage) {
    return cb(null, true);
  } else {
    cb(new Error("Extensão inválida! Envie apenas fotos (.jpg, .jpeg, .png, .tiff, .jfif, .webp)"));
  }
};

// 🚀 3. INICIALIZAÇÃO E EXPORTAÇÃO DO MIDDLEWARE
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter 
});

module.exports = upload;
