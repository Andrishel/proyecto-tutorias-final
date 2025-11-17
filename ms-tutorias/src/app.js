// ms-tutorias/src/app.js

const express = require('express');
const config = require('./config'); // Importamos nuestra configuración centralizada
const tutoriasRouter = require('./api/routes/tutorias.routes');
const errorHandler = require('./api/middlewares/errorHandler'); // El manejador de errores reutilizable
const correlationIdMiddleware = require('./api/middlewares/correlationId.middleware.js');

// --- INICIO DE CAMBIOS SWAGGER ---
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// --- INICIO DE CAMBIOS SWAGGER ---
const swaggerOptions = {
    definition: {
    openapi: '3.0.0',
    info: {
        title: 'Microservicio de Tutorías (ms-tutorias)',
        version: '1.0.0',
        description: 'API del orquestador para solicitar y gestionar tutorías universitarias.',
    },
    servers: [
        {
        url: 'http://localhost:8003', 
        },
    ],
    components: {
        securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Ingresa el token JWT (sin el prefijo "Bearer ")'
        }
        }
    },
    security: [
        {
        bearerAuth: [] 
        }
    ],
    },
    apis: ['./src/api/routes/tutorias.routes.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// --- FIN DE CAMBIOS SWAGGER ---


// Middlewares esenciales
app.use(express.json()); // Permite al servidor entender y procesar bodies en formato JSON
app.use(correlationIdMiddleware); // Añadimos el middleware de correlationIdMiddleware

// Enrutamiento principal
// Cualquier petición a "/tutorias" será gestionada por nuestro router.
app.use('/tutorias', tutoriasRouter);

// Middleware de manejo de errores
// Debe ser el ÚLTIMO middleware que se añade.
app.use(errorHandler);

// Iniciar el servidor
app.listen(config.port, () => {
  console.log(`MS_Tutorias (Orquestador) escuchando en el puerto ${config.port}`);
});