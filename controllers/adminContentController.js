const adminContent = require('../models/adminContent'); // Importa el modelo.

const path = require ('path'); // Necesario para path.extname 




// Configuración de Multer: Define dónde y cómo se guardarán los archivos.
// Es crucial para la subida de archivos.
// Puedes configurar almacenamiento en disco o en memoria,
// y también el nombre de los archivos.







// Esta funcion añade una nueva MOVIE y maneja la subida de archivos.
const addMovie = async (req, res) => {

    console.log('addMovie - req.body (texto):', req.body);
    console.log('addMovie - req.files (archivos):', req.files); // <-- ESTA SALIDA ES LA CLAVE AHORA

    try {
        // 1. Verificar autenticación y rol de administrador del usuario (middleware).
        // 2. Procesar los archivos subidos por Multer (req.files o req.file).
        // 3. Mover los archivos a un almacenamiento permanente (local o S3/GCS/Azure).
        // 4. Obtener las URLs finales de los archivos subidos (video_url, poster_url).

        // Se desestructura solo los campos de texto del req.body
        const {title, description, genre, director, actors, release_date, duration_minutes} = req.body;
         // EJEMPLO: Asumiendo que multer ya procesó los archivos y te da sus rutas
        // En una aplicación real, estas URL vendrían de tu servicio de almacenamiento
        const video_url = req.files && req.files['video'] && req.files['video'][0] ? `/uploads/${req.files['video'][0].filename}`: null;
        const poster_url = req.files && req.files['poster'] && req.files['poster'][0] ? `/uploads/${req.files['poster'][0].filename}`: null;
        const trailer_url = req.body.trailer_url; // Si el trailer es una URL externa o también se sube

        // validaciones basicas de los datos.
        if (!title || !video_url) {
            return res.status(400).json({success: false, message: 'Titulo y URL del video son obligatorios.'});
        }


        const movieData = {
            title,
            description,
            genre,
            director,
            actors,
            release_date,
            trailer_url,
            poster_url,
            video_url,
            duration_minutes: parseInt(duration_minutes) // Debe de ser un numero.
        };

        const result = await adminContent.addMovie(movieData); // Llama al modelo.

        res.status(201).json({
            success: true,
            message: 'Pelicula añadida exitosamente.',
            movieId: result.insertId,
            movieData: {...movieData, id: result.insertId}
        });

    } catch (error) {
        console.error('❌ Error al añadir pelicula:', error);
        res.status(500).json({success: false, message: 'Error interno del servidor al añadir pelicula.', error: error.message});
    }
};






// Obtener todas las películas
const getAllMovies = async (req, res) => {
    try {
        const movies = await adminContent.getAllMovies();
        res.status(200).json({ success: true, movies });
    } catch (error) {
        console.error('❌ Error al obtener películas:', error);
        res.status(500).json({ success: false, message: 'Error interno al obtener películas.' });
    }
};








// Actualizar una película por ID
const updateMovie = async (req, res) => {
    const { id } = req.params;

    console.log('updateMovie - req.body:', req.body);
    console.log('updateMovie - req.files:', req.files);

    try {
        const { title, description, genre, director, actors, release_date, duration_minutes } = req.body;

        const video_url = req.files?.video?.[0]?.filename ? `/uploads/${req.files.video[0].filename}` : null;
        //const poster_url = req.files?.poster?.[0]?.filename ? `/uploads/${req.files.poster[0].filename}` : null;

        const updatedData = {
            title: title ?? null,
            description: description ?? null,
            genre: genre ?? null,
            director: director ?? null,
            actors: actors ?? null,
            release_date: release_date ?? null,
            
            duration_minutes: duration_minutes ? parseInt(duration_minutes): null,
            ...(video_url && { video_url }),
            
        };

        const result = await adminContent.updateMovie(id, updatedData);

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Película actualizada exitosamente.' });
        } else {
            res.status(404).json({ success: false, message: 'Película no encontrada.' });
        }

    } catch (error) {
        console.error('❌ Error al actualizar película:', error);
        res.status(500).json({ success: false, message: 'Error interno al actualizar película.' });
    }
};

















// Eliminar una película por ID
const deleteMovie = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await adminContent.deleteMovie(id);
        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Película eliminada correctamente.' });
        } else {
            res.status(404).json({ success: false, message: 'Película no encontrada.' });
        }
    } catch (error) {
        console.error('❌ Error al eliminar película:', error);
        res.status(500).json({ success: false, message: 'Error interno al eliminar película.' });
    }
};






module.exports ={
    addMovie,
    getAllMovies,
    deleteMovie,
    updateMovie
    
    


}