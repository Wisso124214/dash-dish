import "dotenv/config.js";

const config = {
  PORT: process.env.PORT || 3100,
  SERVER_IP: "localhost",
  PROTOCOL: "http",
  get SERVER_URL() {
    return `${this.PROTOCOL}://${this.SERVER_IP}:${this.PORT}`;
  },
  DB_URL: process.env.DB_URL,

  PROFILES: {
    CLIENT: {
      name: "cliente",
    },
    ADMIN: {
      name: "admin",
    },
  },

  ERROR_CODES: {
    BAD_REQUEST: 400, // El servidor no pudo entender la solicitud debido a una sintaxis inválida
    UNAUTHORIZED: 401, // La solicitud requiere autenticación del usuario
    FORBIDDEN: 403, // El servidor entendió la solicitud, pero se niega a autorizarla
    NOT_FOUND: 404, // El servidor no pudo encontrar el recurso solicitado
    REQUEST_TIMEOUT: 408, // El servidor agotó el tiempo de espera esperando la solicitud
    CONFLICT: 409, // La solicitud no se pudo completar debido a un conflicto con el estado actual del recurso. Por ejemplo, intentar registrar un usuario con un nombre de usuario o correo electrónico que ya existe
    INTERNAL_SERVER_ERROR: 500, // El servidor encontró una condición inesperada que le impidió completar la solicitud
    DB_ERROR: 503, // El servidor no está disponible actualmente (porque está sobrecargado o en mantenimiento). Generalmente, esto es temporal
  },

  // Ejemplo de definición de tipos personalizados
  // number: (value) => typeof value === 'number',
  customTypes: {},
};

export default config;
