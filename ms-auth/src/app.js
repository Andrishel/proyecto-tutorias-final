// ms-auth/src/app.js

const express = require('express');
const config = require('./config');
const authRouter = require('./api/routes/auth.routes');
const errorHandler = require('./api/middlewares/errorHandler');
const messageProducer = require('./infrastructure/messaging/message.producer');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use('/auth', authRouter);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`MS_Auth escuchando en el puerto ${config.port}`);
  messageProducer.connect();
});