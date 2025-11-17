// ms-auth/src/app.js
const express = require('express');
const config = require('./config');
const authRouter = require('./api/routes/auth.routes');
const errorHandler = require('./api/middlewares/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// Configuración de Swagger
const swaggerOptions = {
    definition: {
    openapi: '3.0.0',
    info: {
        title: 'Microservicio de Autenticación (ms-auth)',
        version: '1.0.0',
        description: 'API para gestionar el login y registro de usuarios.',
    },
    servers: [
        { url: 'http://localhost:8000' }, 
    ],
    },
    apis: ['./src/api/routes/auth.routes.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use('/auth', authRouter);
app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`MS_Auth escuchando en el puerto ${config.port}`);
});