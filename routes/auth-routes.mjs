import express from 'express';
import { registrarUsuario, login } from '../controllers/auth-controller.mjs';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: El usuario ya existe
 */
router.post('/register', registrarUsuario);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión y devuelve el token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve el token
 *       400:
 *         description: Credenciales inválidas
 */
router.post('/login', login);

export default router;