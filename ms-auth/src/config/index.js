require('dotenv').config();

const config = {
    port: process.env.PORT || 4000,
    jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    },
    rabbitmqUrl: process.env.RABBITMQ_URL
};

if (!config.jwt.secret) {
    throw new Error('FATAL ERROR: JWT_SECRET no está definida en las variables de entorno.');
}

module.exports = config;
