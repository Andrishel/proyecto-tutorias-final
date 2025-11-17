// ms-tutorias/src/config/index.js
require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    usuariosServiceUrl: process.env.MS_USUARIOS_URL,
    agendaServiceUrl: process.env.MS_AGENDA_URL,
    notificacionesServiceUrl: process.env.MS_NOTIFICACIONES_URL,
    jwtSecret: process.env.JWT_SECRET,
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://rabbit:rabbit@rabbitmq:5672'
};
