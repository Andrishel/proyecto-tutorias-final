// ms-agenda/src/app.js
const express = require('express');
const config = require('./config'); // <-- USAR EL NUEVO CONFIG
const agendaRouter = require('./api/routes/agenda.routes');
const errorHandler = require('./api/middlewares/errorHandler');
const correlationIdMiddleware = require('./api/middlewares/correlationId.middleware.js');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const messageProducer = require('./infrastructure/messaging/message.producer'); // <-- IMPORTAR PRODUCTOR

const app = express();

// CONFIGURAACIÓN YAML
const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(correlationIdMiddleware);
app.use('/agenda', agendaRouter);
app.use(errorHandler);

app.listen(config.port, () => { // <-- Usar config.port
    console.log(`MS_Agenda escuchando en el puerto ${config.port}`);
    messageProducer.connect(); // <-- INICIAR CONEXIÓN A RABBITMQ
});