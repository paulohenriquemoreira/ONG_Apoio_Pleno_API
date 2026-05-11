const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  
});

// A REGRA DE OURO DAS EXTENSÕES
const fileFilter = (req, file, cb) => {
  const extensoesPermitidas = /jpeg|jpg|png|tiff|jfif|webp/i;
  
  // 1. Verifica a extensão
  const extname = extensoesPermitidas.test(path.extname(file.originalname));
  
  // 🖨️ ISTO VAI MOSTRAR NO TERMINAL O QUE O POSTMAN ENVIOU:
  console.log(`Tentando subir: ${file.originalname} | Mimetype interno: ${file.mimetype}`);
  
  // 2. Verifica se é imagem OU se é o formato genérico que o Postman manda quando se confunde
  const isImage = file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream';

  if (extname && isImage) {
    return cb(null, true);
  } else {
    cb(new Error("Extensão inválida! Envie apenas fotos (.jpg, .jpeg, .png, .tiff, .jfif, .webp)"));
  }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter // Adiciona o filtro aqui na exportação
});

module.exports = upload;