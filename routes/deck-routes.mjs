import express from 'express';
import {
    crearMazo,
    obtenerMisMazos,
    agregarCartaAlMazo,
    eliminarMazo,
    eliminarCartaDeMazo,
    actualizarMazo
} from '../controllers/deck-controller.mjs';
import { verificarToken } from '../middlewares/auth-middleware.mjs';

const router = express.Router();

/**
 * @swagger
 * /decks:
 *   post:
 *     summary: Crea un nuevo mazo vacío
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               format:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mazo creado exitosamente
 */
router.post('/', verificarToken, crearMazo);

/**
 * @swagger
 * /decks:
 *   get:
 *     summary: Obtiene todos los mazos del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mazos
 */
router.get('/', verificarToken, obtenerMisMazos);

/**
 * @swagger
 * /decks/{idMazo}:
 *   delete:
 *     summary: Elimina un mazo completo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idMazo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mazo eliminado exitosamente
 */
router.delete('/:idMazo', verificarToken, eliminarMazo);

/**
 * @swagger
 * /decks/{idMazo}/cards:
 *   post:
 *     summary: Busca una carta en Scryfall y la agrega al mazo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idMazo
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreCarta:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Carta agregada o cantidad actualizada
 */
router.post('/:idMazo/cards', verificarToken, agregarCartaAlMazo);

/**
 * @swagger
 * /decks/{idMazo}/cards/{idCarta}:
 *   delete:
 *     summary: Elimina una carta específica del mazo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idMazo
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: idCarta
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carta eliminada del mazo exitosamente
 */
router.delete('/:idMazo/cards/:idCarta', verificarToken, eliminarCartaDeMazo);
/**
 * @swagger
 * /decks/{idMazo}:
 *   put:
 *     summary: Actualiza el nombre, formato o descripción de un mazo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idMazo
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               format:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mazo actualizado correctamente
 */
router.put('/:idMazo', verificarToken, actualizarMazo);
export default router;