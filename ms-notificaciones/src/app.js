// ms-notificaciones/src/app.js
const express = require('express');
const config = require('./config');
const notificacionesRouter = require('./api/routes/notificaciones.routes');
const errorHandler = require('./api/middlewares/errorHandler');
const correlationIdMiddleware = require('./api/middlewares/correlationId.middleware.js');
const amqp = require('amqplib'); 
const notificacionService = require('./domain/services/notificacion.service');
const messageProducer = require('./infrastructure/messaging/message.producer'); // <-- Productor del Docente

// REQUIRES PARA SWAGGER
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const PORT = process.env.PORT || 3003;

const app = express();

// CONFIGURACIÓN YAML SWAGGER
const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(correlationIdMiddleware); // Middleware para manejar el Correlation ID
app.use('/notificaciones', notificacionesRouter);
app.use(errorHandler);

// --- MISION 4 - Lógica del Consumidor de RabbitMQ  ---
const startConsumer = async () => {
    let connection;
    try {
        connection = await amqp.connect(config.rabbitmqUrl);
        const channel = await connection.createChannel();

        // 1. Declaramos el exchange de meurtos (DLX) y la cola de muertos (DLQ)
        const dlxName = 'notificaciones_dlx';
        const dlqName = 'notificaciones_dlq';

        await channel.assertExchange(dlxName, 'fanout', { durable: true });
        await channel.assertQueue(dlqName, { durable: true });
        await channel.bindQueue(dlqName, dlxName, '');
        console.log('[MS_Notificaciones] Infraestructura DLQ configurada.');

        // 2. Declarar la Cola Principal conectada al DLX
        const queueName = 'notificaciones_email_queue';
        await channel.assertQueue(queueName, {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': dlxName // <-- Por si falle se va por aui
            }
        });

        channel.prefetch(1); 
        console.log(`[MS_Notificaciones] Esperando mensajes en la cola: ${queueName}`);

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                let payload;
                try {
                    // Intentamos parsear. Si no es JSON válido, fallará y se irá al catch
                    payload = JSON.parse(msg.content.toString());
                    
                    console.log(`[MS_Notificaciones] Mensaje recibido de RabbitMQ:`, JSON.stringify(payload));

                    // Procesar el mensaje
                    await notificacionService.enviarEmailNotificacion(payload);

                    // Confirmar éxito
                    channel.ack(msg);
                    console.log(`[MS_Notificaciones] Mensaje procesado y confirmado (ack).`);

                } catch (error) {
                    console.error(`[MS_Notificaciones] ERROR FATAL al procesar mensaje: ${error.message}`);
                    
                    // 3. RECHAZAR EL MENSAJE (NACK) SIN REENCOLAR
                    // Al poner 'requeue: false', RabbitMQ lo enviará automáticamente a la DLQ
                    channel.nack(msg, false, false); 
                    console.log(`[MS_Notificaciones] Mensaje enviado a DLQ (Dead Letter Queue).`);
                }
            }
        }, {
            noAck: false // Importante: Confirmación manual activada
        });

    } catch (error) {
        console.error('[MS_Notificaciones] Error al conectar/consumir de RabbitMQ:', error.message);
        setTimeout(startConsumer, 5000); // Reintentar conexión en 5 segundos
    }
};

// Iniciar el servidor y el consumidor de RabbitMQ
app.listen(config.port, () => {
    console.log(`MS_Notificaciones (API) escuchando en el puerto ${config.port}`);
    startConsumer();
    messageProducer.connect(); // <-- Conexión de telemetría
});