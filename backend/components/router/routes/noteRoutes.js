import axios from 'axios';
import Config from '../../config/config.js';

const config = new Config().getConfig();
const { SERVER_URL } = config;

export const createNoteRoutes = async (app) => {};
