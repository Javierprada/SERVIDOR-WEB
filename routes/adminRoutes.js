const express = require ('express');
const router = express.Router();
const adminContentController = require('../controllers/adminContentController'); 
const {verificarToken, verificarRolAdmin} = require('../middlewares/authMiddleware');
const upload = require('../middleware/uploads');
//console.log('__dirname en adminRoutes.js:', __dirname); // ✅ Esto imprimirá la ruta absoluta del archivo


// 📦 Crear película (sube video y poster)
router.post(
  '/movies',
  verificarToken,
  verificarRolAdmin,
  upload.fields([{ name: 'video' }, { name: 'poster' }]),
  adminContentController.addMovie
);

// ✏️ Actualizar película
router.put(
  '/update/:id',
  verificarToken,
  verificarRolAdmin,
  upload.fields([{ name: 'video' }, { name: 'poster' }]),
  adminContentController.updateMovie
);

// 📄 Obtener todas las películas
router.get(
  '/movies',
  verificarToken,
  adminContentController.getAllMovies
);

// 🗑️ Eliminar película
router.delete(
  '/delete/:id',
  verificarToken,
  verificarRolAdmin,
  adminContentController.deleteMovie
);


module.exports = router;





