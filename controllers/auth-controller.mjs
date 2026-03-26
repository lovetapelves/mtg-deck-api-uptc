import { User } from '../models/User.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Asegúrate de agregar este import arriba

export const registrarUsuario = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Verificamos si el usuario ya existe para no tener duplicados
        const usuarioExistente = await User.findOne({ username });
        if (usuarioExistente) {
            return res.status(400).json({ error: "El usuario ya existe" });
        }

        // 2. Encriptamos (Hasheamos) la contraseña
        const salt = await bcrypt.genSalt(10); // Genera un factor de aleatoriedad
        const passwordEncriptada = await bcrypt.hash(password, salt);

        // 3. Creamos el usuario en memoria con la contraseña protegida
        const nuevoUsuario = new User({
            username: username,
            password: passwordEncriptada
        });

        // 4. Persistimos en MongoDB
        await nuevoUsuario.save();

        res.status(201).json({ mensaje: "Usuario registrado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor", detalle: error.message });
    }

};
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Buscamos si el usuario existe
        const usuario = await User.findOne({ username });
        if (!usuario) {
            return res.status(400).json({ error: "Credenciales inválidas" });
        }

        // 2. Comparamos la contraseña enviada con la encriptada en la BD
        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            return res.status(400).json({ error: "Credenciales inválidas" });
        }

        // 3. Si todo está bien, creamos el PAYLOAD (la carga útil)
        const payload = {
            id: usuario._id,
            username: usuario.username
        };

        // 4. Firmamos el TOKEN usando el secreto del .env
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({
            mensaje: "Login exitoso",
            token: token
        });
    } catch (error) {
        res.status(500).json({ error: "Error en el login" });
    }
};