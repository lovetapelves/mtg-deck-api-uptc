import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    // 1. Obtenemos el token del header 'Authorization'
    // El estándar es: Bearer <token>
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. No se proporcionó un token." });
    }

    try {
        // 2. Verificamos que el token sea auténtico y no haya expirado
        const verificado = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Guardamos los datos del usuario en el objeto 'req' 
        // para que los controladores sepan quién está haciendo la petición
        req.user = verificado;

        // 4. ¡Pase libre! Continuamos al siguiente paso (el controlador)
        next();
    } catch (error) {
        res.status(403).json({ error: "Token inválido o expirado." });
    }
};