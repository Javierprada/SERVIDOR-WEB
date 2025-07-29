const {pool} = require ('../config/db'); // 


const adminContent = {
    /** s
    *Inserta una nueva pelicula en la BD
    *@param {object} movieData // Objeto con los datos de la aplicación...
    */
  addMovie: async (movieData) => {
    const {title, description, genre, director, actors, release_date, trailer_url, poster_url, video_url, duration_minutes} = movieData;
    const query = `INSERT INTO movies (title, description, genre, director, actors, release_date, trailer_url, poster_url, video_url, duration_minutes) VALUES (?,?,?,?,?,?,?,?,?,?)`;
    const [result] = await pool.execute(query, [title, description, genre, director, actors, release_date, trailer_url, poster_url, video_url, duration_minutes]);
    return result;
  },

  /**
   * Busca una pelicula por ID.
   * @param {number} id - El ID de la movie.
   */
     
    findMovieById: async (id) => {
        const query = 'SELECT * FROM movies WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0]; // Retorna la primera fila, si existe.
    },



    /**
     * 
     * @param {number} id - el ID de la movie a actualizar.
     * @param {object} movieData - objeto con los datos actualizados de la movie. 
     * @returns 
     */



    updateMovie: async (id, movieData) => {
        const {title, description, genre, director, actors, release_date, video_url, duration_minutes} = movieData;
        const query = `UPDATE MOVIES SET title = ?, description = ?, genre = ?, director = ?, actors = ?, release_date = ?, video_url = ?, duration_minutes = ? WHERE id = ?`;
        const [result] = await pool.execute(query, [title, description, genre, director, actors, release_date, video_url, duration_minutes, id]);
        return result;
    },





    /**
   * Obtiene todas las películas.
   */
  getAllMovies: async () => {
    const [rows] = await pool.query('SELECT * FROM movies ORDER BY id DESC');
    return rows;
  },




  /**
   * Elimina una película por ID.
   */
  deleteMovie: async (id) => {
    const query = 'DELETE FROM movies WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result;
  }









    // Pendiente por adicionar funciones como;  findAllMovies, searchMovies.
};

module.exports = adminContent;