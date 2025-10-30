import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';

let app = null;

do {
  app = (() => {
    const newApp = express();
    newApp.use(cors());
    newApp.use(bodyParser.json());
    newApp.use(express.urlencoded({ extended: true }));
    newApp.use(
      session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
      })
    );
    return newApp;
  })();
} while (!app);

export default app;
