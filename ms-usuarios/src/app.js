const express = require('express');
const usuariosRouter = require('./api/routes/usuarios.routes');
const errorHandler = require('./api/middlewares/errorHandler');
const correlationIdMiddleware = require('./api/middlewares/correlationId.middleware.js');

// NUEVAS IMPORTACIONES (Sin swagger-jsdoc)
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT || 8001;
const app = express();

// CONFIGURACIÓN YAML
const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());
app.use(express.json());
app.use(correlationIdMiddleware);
app.use('/usuarios', usuariosRouter);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`MS_Usuarios escuchando en el puerto ${PORT}`);
});