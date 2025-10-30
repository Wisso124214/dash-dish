import Config from './components/config/config.js';
import DBMS from './components/dbms/dbms.js';
import app from './middleware.js';
import Session from './components/session/session.js';
import Validator from './components/validator/validator.js';
import Router from './components/router/router.js';
import Controller from './components/controller/controller.js';

const dbms = new DBMS(app);
const validator = new Validator();
const session = new Session();
const router = new Router(app);
const controller = new Controller(app);

dbms
  .dbConnection()
  .then(async () => {
    await session.init(app);
    await router.init();
    await controller.init();

    //**Dev trials */
    try {
      const TrialTests = await import('./.dev-trials/trial-tests.js');
      const trialTests = new TrialTests.default();
      await trialTests.init();
    } catch (error) {
      console.log('-- No dev trial tests found. --');
    }
  })
  .catch((err) => {
    console.log('Error server listening ', err);
  });

process.on('uncaughtException', (err) => {
  console.log(err);
});
