const express = require('express');
const router = express.Router();
const tutoriasController = require('../controllers/tutorias.controller');
const verifyTokenMiddleware = require('../middlewares/jwt.middleware.js');

router.post('/', verifyTokenMiddleware, tutoriasController.postSolicitud);

module.exports = router;