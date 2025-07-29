const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'ultra_secreta';

function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Espera 'Bearer TOKEN'

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado. ❌' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // Guardamos los datos del token en la solicitud
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado. ❌' });
    }
}

function verificarRolAdmin(req, res, next) {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'Solo administradores pueden acceder. ⚠️' });
    }
    next();
}

module.exports = { verificarToken, verificarRolAdmin };