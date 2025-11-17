// ms-usuarios/src/app.js

const express = require('express');
const usuariosRouter = require('./api/routes/usuarios.routes');
const errorHandler = require('./api/middlewares/errorHandler');
const correlationIdMiddleware = require('./api/middlewares/correlationId.middleware.js');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');

const PORT = process.env.PORT || 8001;

const app = express();

// --- CONFIG SWAGGER ---
const swaggerOptions = {
    definition: {
    openapi: '3.0.0',
    info: {
        title: 'Microservicio de Usuarios (ms-usuarios)',
        version: '1.0.0',
        description: 'API para gestionar información de estudiantes y tutores.',
    },
    servers: [
        { url: 'http://localhost:8001' },
    ],
    // Opcional: activa JWT si este microservicio lo usa
    components: {
        securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            },
        },
    },
    },
    apis: [__dirname + '/api/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// --- FIN SWAGGER ---

// Middlewares
app.use(cors());
app.use(express.json());
app.use(correlationIdMiddleware);

// Rutas
app.use('/usuarios', usuariosRouter);

// Manejo de errores
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`MS_Usuarios escuchando en el puerto ${PORT}`);
});
