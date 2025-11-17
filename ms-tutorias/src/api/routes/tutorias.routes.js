// ms-tutorias/src/api/routes/tutorias.routes.js

const express = require('express');
const router = express.Router();
const tutoriasController = require('../controllers/tutorias.controller');
const verifyTokenMiddleware = require('../middlewares/jwt.middleware.js');

/**
 * @swagger
 * /tutorias:
 *   post:
 *     summary: Solicitar una nueva tutoría
 *     description: Crea una solicitud de tutoría validando disponibilidad y enviando notificaciones. Requiere Token JWT.
 *     tags: [Tutorias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idTutor
 *               - materia
 *               - fecha
 *             properties:
 *               idTutor:
 *                 type: string
 *                 description: ID del tutor solicitado
 *                 example: "t09876"
 *               materia:
 *                 type: string
 *                 description: Nombre de la materia
 *                 example: "Cálculo Multivariable"
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora propuesta para la tutoría (ISO 8601)
 *                 example: "2025-12-10T11:00:00Z"
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente.
 *       400:
 *         description: Datos inválidos o conflicto de agenda (Tutor ocupado).
 *       401:
 *         description: No autorizado (Token faltante o inválido).
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', verifyTokenMiddleware, tutoriasController.postSolicitud);

module.exports = router;
