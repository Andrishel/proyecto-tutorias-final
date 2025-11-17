const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * /auth/token:
 *   post:
 *     summary: Inicia sesión y genera un token JWT
 *     description: Valida las credenciales del usuario y devuelve un token de acceso.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "ana.torres"
 *               password:
 *                 type: string
 *                 example: "password_ana"
 *     responses:
 *       200:
 *         description: Token generado exitosamente.
 *       401:
 *         description: Credenciales inválidas.
 */
router.post('/token', authController.postToken);

module.exports = router;
