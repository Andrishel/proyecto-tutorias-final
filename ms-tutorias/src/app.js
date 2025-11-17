// ms-tutorias/src/app.js
const express = require('express');
const config = require('./config');
const tutoriasRouter = require('./api/routes/tutorias.routes');
const errorHandler = require('./api/middlewares/errorHandler');
const correlationIdMiddleware = require('./api/middlewares/correlationId.middleware.js');

// REQUIRES OBLIGATORIOS PARA SWAGGER
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

// ARCHIVO DESDE LA CARPETA DOCS
const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

// RUTA DE DOCUMENTACIÓN
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(correlationIdMiddleware);
app.use('/tutorias', tutoriasRouter);

app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`MS_Tutorias (Orquestador) escuchando en el puerto ${config.port}`);
});