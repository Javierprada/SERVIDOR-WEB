const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });

    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {

    // Separar nombre base y extensión
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext);



    // Limpia el nombre original y añade timestamp
    const sanitized = file.originalname.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // quita acentos
    const cleanName = sanitized
    .replace(/[^\w.-]/gi, '_') // reemplaza caracteres no válidos
    .replace(/\.+$/, '')   // elimina puntos al final
    .replace(/_+/g, '_'); // reemplaza caracteres no válidos
    const uniqueSuffix = Date.now() + '-' + cleanName;
    console.log('🧾 Guardando archivo como:', uniqueSuffix);
    cb(null, uniqueSuffix);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB
  fileFilter: function (req, file, cb) {
    const videoTypes = /mp4|avi|mkv|mov|webm/;
    const imageTypes = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();

    if (file.fieldname === 'video' && videoTypes.test(ext)) return cb(null, true);
    if (file.fieldname === 'poster' && imageTypes.test(ext)) return cb(null, true);

    return cb(new Error('❌ Archivo no permitido'));
  }
});

module.exports = upload;