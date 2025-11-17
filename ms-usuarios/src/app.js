// ms-usuarios/src/app.js
const express = require('express');
const config = require('./config'); // <-- USAR EL NUEVO CONFIG
const usuariosRouter = require('./api/routes/usuarios.routes');
const errorHandler = require('./api/middlewares/errorHandler');
const correlationIdMiddleware = require('./api/middlewares/correlationId.middleware.js');
const messageProducer = require('./infrastructure/messaging/message.producer'); // <-- IMPORTAR PRODUCTOR (Profesor)
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const cors = require('cors');

const app = express();

// CONFIGURACIÓN YAML
const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// MIDDLEWARES 
app.use(cors()); 
app.use(express.json());
app.use(correlationIdMiddleware);

app.use('/usuarios', usuariosRouter);
app.use(errorHandler);

// PARA ESCUCHAR
app.listen(config.port, () => { 
    console.log(`MS_Usuarios escuchando en el puerto ${config.port}`);
    messageProducer.connect(); // <-- INICIAR CONEXIÓN A RABBITMQ
});