// ms-tutorias/src/infrastructure/clients/usuarios.client.js
const axios = require('axios');
const CircuitBreaker = require('opossum'); // Libreria del Circuit Breaker
const { usuariosServiceUrl } = require('../../config');
const { publishTrackingEvent } = require('../messaging/message.producer'); // <-- Para reportar al Dashboard

// --- CONFIGURACIÓN DEL CIRCUIT BREAKER (Misión 2) ---
const breakerOptions = {
    timeout: 1500, // Si tarda más de 1.5s, falla (Fail Fast)
    errorThresholdPercentage: 50, // Si el 50% falla, abre el circuito
    resetTimeout: 10000 // Espera 10s antes de intentar cerrar el circuito de nuevo
};

// Esta es la función original, ahora envuelta para ser controlada por el Breaker
const realizarPeticionAxios = async (tipo, id, correlationId) => {
    // Construimos la URL
    const url = `${usuariosServiceUrl}/${tipo}/${id}`;

    // --- LOGS DE DEPURACIÓN ---
    console.log(`[SUPER-DEBUG] Iniciando llamada a getUsuario con Correlation-ID: ${correlationId}`);
    console.log(`[SUPER-DEBUG] URL de destino: ${url}`);
    console.log(`[SUPER-DEBUG] Tipo: ${tipo}, ID: ${id}`);
    // --- FIN LOGS DE DEPURACIÓN ---

    try {
        // Nota: Opossum manejará el timeout global, pero dejamos axios limpio
        const response = await axios.get(url, {
            headers: { 'X-Correlation-ID': correlationId }
        });
        console.log(`[SUPER-DEBUG] Éxito en la llamada a ${url}. Status: ${response.status}`);
        return response.data;
    } catch (error) {
        // --- LOGS DE ERROR DETALLADOS ---
        console.error(`[SUPER-DEBUG] FALLO en la llamada a ${url}.`);
        if (error.response) {
            // Este bloque se ejecuta si el servidor SÍ respondió, pero con un error (4xx, 5xx)
            console.error(`[SUPER-DEBUG] El servidor respondió con Status: ${error.response.status}`);
            console.error(`[SUPER-DEBUG] Data del error:`, JSON.stringify(error.response.data));
            if (error.response.status === 404) {
                return null; // El usuario no existe, no es un error de sistema
            }
        } else if (error.request) {
            // Este bloque se ejecuta si la petición se hizo pero NUNCA se recibió respuesta (error de red)
            console.error('[SUPER-DEBUG] La petición fue enviada pero no se recibió respuesta. Error de red (timeout, DNS, etc).');
        } else {
            // Este bloque se ejecuta si hubo un error al configurar la petición antes de enviarla
            console.error('[SUPER-DEBUG] Error fatal al configurar la petición axios:', error.message);
        }
        console.error('[SUPER-DEBUG] Objeto de error completo de Axios:', error.code, error.message);
        // --- FIN LOGS DE ERROR DETALLADOS ---
        throw error;
    }
};

const breaker = new CircuitBreaker(realizarPeticionAxios, breakerOptions);
breaker.on('open', () => {
    console.warn('[CircuitBreaker] ABIERTO: ms-usuarios no responde.');
    publishTrackingEvent({
        service: 'MS_Tutorias',
        message: 'Circuit Breaker ABIERTO para ms-usuarios (Fallo de Red)',
        timestamp: new Date(),
        status: 'ERROR',
        cid: 'SYSTEM_EVENT' 
    });
});

breaker.on('halfOpen', () => console.log('[CircuitBreaker] Entreabierto: Probando conexión...'));
breaker.on('close', () => console.log('[CircuitBreaker] CERRADO: ms-usuarios recuperado.'));

const getUsuario = async (tipo, id, correlationId) => {
    try {
        // Se ejecuta la petición a través del breaker
        const result = await breaker.fire(tipo, id, correlationId);
        return result;
    } catch (error) {
        // Si el error es porque el circuito está abierto entonnes lanzamos un error específico 503
        if (error.type === 'open') {
            console.error('[CircuitBreaker] Petición rechazada inmediatamente (Circuito Abierto).');
            throw { statusCode: 503, message: 'El servicio de usuarios no está disponible temporalmente (Circuit Open).' };
        }
        // Si es otro error como timeout de opossum o error de axios), lo volvemos a enviar
        throw error;
    }
};

module.exports = { getUsuario };