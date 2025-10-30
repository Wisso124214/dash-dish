import jwt from 'jsonwebtoken';

/**
 * Genera un token JWT con la data del usuario
 * @param {Object} userData - Información del usuario para el payload
 * @returns {string} Token JWT
 */
export default class Tokenizer {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'default_secret';
  }

  generateToken(userData) {
    return jwt.sign(userData, this.secret, { expiresIn: '5min' });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      return null;
    }
  }
}
