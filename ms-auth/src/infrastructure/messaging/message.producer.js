const amqp = require('amqplib');
const config = require('../../config');

let channel = null;

const connect = async () => {
    try {
    const connection = await amqp.connect(config.rabbitmqUrl);
    channel = await connection.createChannel();
    console.log('Conectado a RabbitMQ para telemetría.');
    } catch (error) {
    console.error('Error conectando a RabbitMQ (Producer):', error.message);
    } 
};

const publish = async (queue, message) => {
    if (!channel) {
    console.warn('No hay canal de RabbitMQ para publicar mensaje de telemetría.');
    return;
    }
    try {
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
    console.error('Error publicando mensaje:', error.message);
    }
};

module.exports = {
    connect,
    publish
};
