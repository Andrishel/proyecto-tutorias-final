const express = require('express');
const agendaRouter = require('./api/routes/agenda.routes');
const errorHandler = require('./api/middlewares/errorHandler');
const correlationIdMiddleware = require('./api/middlewares/correlationId.middleware.js');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const PORT = process.env.PORT || 3002;
const app = express();

// CONFIGURACIÓN YAML
const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(correlationIdMiddleware);
app.use('/agenda', agendaRouter);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`MS_Agenda escuchando en el puerto ${PORT}`);
});