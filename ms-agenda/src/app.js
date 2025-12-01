// ms-agenda/src/app.js
const express = require('express');
const config = require('./config'); // <-- USAR EL NUEVO CONFIG
const agendaRouter = require('./api/routes/agenda.routes');
const errorHandler = require('./api/middlewares/errorHandler');
const correlationIdMiddleware = require('./api/middlewares/correlationId.middleware.js');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const messageProducer = require('./infrastructure/messaging/message.producer'); 
const client = require('prom-client');

const app = express();
// Registro de métricas Prometheus
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// DEFINICIÓN DE LA MÉTRICA  
const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

// CONFIGURAACIÓN YAML
const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(correlationIdMiddleware);
app.use('/agenda', agendaRouter);
app.use(errorHandler);

// Middleware para las metricas de Prometheus
app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
    end({ method: req.method, route: req.path, code: res.statusCode });
    });
    next();
});
// Endpoint para las metricas de Prometheus
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

app.listen(config.port, () => { // <-- Usar config.port
    console.log(`MS_Agenda escuchando en el puerto ${config.port}`);
    messageProducer.connect(); // <-- INICIAR CONEXIÓN A RABBITMQ


});