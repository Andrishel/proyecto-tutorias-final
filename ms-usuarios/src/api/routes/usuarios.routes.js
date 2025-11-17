// src/api/routes/usuarios.routes.js

const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

/**
 * @swagger
 * /usuarios/estudiantes/{id}:
 *   get:
 *     summary: Obtener información de un estudiante por ID
 *     description: Devuelve los detalles del estudiante basado en su ID.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: Estudiante encontrado exitosamente.
 *       404:
 *         description: Estudiante no encontrado.
 */
router.get('/estudiantes/:id', usuariosController.obtenerEstudiante);

/**
 * @swagger
 * /usuarios/tutores/{id}:
 *   get:
 *     summary: Obtener información de un tutor por ID
 *     description: Devuelve los detalles del tutor basado en su ID.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del tutor
 *     responses:
 *       200:
 *         description: Tutor encontrado exitosamente.
 *       404:
 *         description: Tutor no encontrado.
 */
router.get('/tutores/:id', usuariosController.obtenerTutor);

module.exports = router;
