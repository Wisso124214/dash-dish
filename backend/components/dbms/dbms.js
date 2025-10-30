import mongoose from 'mongoose';
import Config from '../config/config.js';
import Utils from '../utils/utils.js';

export default class DBMS {
  constructor(app = null) {
    this.utils = new Utils();
    this.config = new Config();
    this.SERVER_URL = this.config.SERVER_URL;
    this.app = app;
    this.DB_URL = this.config.DB_URL;
    this.PORT = this.config.PORT;

    if (!DBMS.instance) {
      this.ERROR_CODES = this.config.getErrorCodes();

      DBMS.instance = this;
    }
    return DBMS.instance;
  }

  async dbConnection() {
    await mongoose
      .connect(this.DB_URL)
      .then(() => {
        this.app.listen(this.PORT, () => {
          console.log(`Connected to the database on port ${this.PORT}`);
        });
      })
      .catch((error) => {
        console.log('Error connecting to the database: ', error);
      });
  }

  async query(query, params = {}) {
    try {
      return await fetch(`${this.SERVER_URL}${query}`, params).then(
        (response) => response.json()
      );
    } catch (error) {
      return this.utils.handleError({
        message: error.message || 'Error executing query',
        errorCode: this.ERROR_CODES.DB_ERROR,
        error,
      });
    }
  }
}
