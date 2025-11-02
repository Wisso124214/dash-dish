import bcrypt from 'bcrypt';
import Validator from '../validator/validator.js';
import Config from '../config/config.js';
import {
  createAndUpdateSession,
  destroySession,
  getSession,
  existSession,
} from './sessionManager.js';
import Tokenizer from '../tokenizer/tokenizer.js';
import Mailer from '../mailer/mailer.js';
import Repository from '../repository/repository.js';
import DBMS from '../dbms/dbms.js';

export const createRoutes = async (app) => {
  const config = new Config();
  const { SERVER_URL, ERROR_CODES, PROFILES } = config.getConfig();

  const dbms = new DBMS();
  const validator = new Validator();
  const tokenizer = new Tokenizer();
  const mailer = new Mailer();
  const repo = new Repository();

  app.post('/login', async (req, res) => {
    if (existSession(req, res)) {
      return res.send({
        message: `Ya has iniciado sesión. Cierra la sesión para continuar.`,
        redirect: '/home',
      });
    }

    const userData = req.body || JSON.parse(req.headers.data || '{}');
    if (!userData || !userData.username || !userData.password) {
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: 'Por favor ingrese nombre de usuario y contraseña',
      });
    }

    const users = await fetch(`${SERVER_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => res.json());

    if (!users || users.length === 0) {
      return res.status(ERROR_CODES.NOT_FOUND).send({
        errorCode: ERROR_CODES.NOT_FOUND,
        message: 'No hay usuarios registrados',
      });
    }

    const user = users.find((u) => u.username === userData.username);
    if (!user) {
      return res.status(ERROR_CODES.NOT_FOUND).send({
        errorCode: ERROR_CODES.NOT_FOUND,
        message:
          'Usuario no encontrado. Verifique su nombre de usuario o regístrese.',
      });
    }

    await repo
      .getUsersWhere({ username: userData.username })
      .then(async (users) => {
        if (!users) {
          return res.status(ERROR_CODES.NOT_FOUND).send({
            errorCode: ERROR_CODES.NOT_FOUND,
            message: 'Usuario no encontrado. Verifique sus credenciales.',
          });
        } else if (Array.isArray(users) && users?.length > 1) {
          return res.status(ERROR_CODES.BAD_REQUEST).send({
            errorCode: ERROR_CODES.BAD_REQUEST,
            message:
              'Se han encontrado múltiples usuarios con ese nombre de usuario. Por favor contacte al soporte.',
          });
        }
        const userId = users?.[0]?._id;

        const userRes = await fetch(`${SERVER_URL}/user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const user = await userRes.json();
        const passwordMatch = bcrypt.compareSync(
          userData.password,
          user.password
        );
        if (passwordMatch) {
          await repo
            .getUserProfiles(user.username)
            .then(async (userProfiles) => {
              if (
                userData.activeProfile &&
                userProfiles?.includes(userData.activeProfile)
              ) {
                createAndUpdateSession(req, userData);
                return res.send({
                  message: `Bienvenido ${userData.activeProfile}, ${user.username}`,
                });
              } else if (userProfiles?.length > 1) {
                return res.send({
                  message: `Seleccione el perfil con el que desea iniciar sesión`,
                  profiles: userProfiles,
                });
              } else {
                createAndUpdateSession(req, userData);
                console.log(
                  'User ' + user.username + ' logged in with profile:',
                  userProfiles?.[0]
                );
                return res.send({
                  message: `Bienvenido ${userProfiles?.[0]}, ${user.username}`,
                });
              }
            });
        } else {
          return res.status(ERROR_CODES.UNAUTHORIZED).send({
            errorCode: ERROR_CODES.UNAUTHORIZED,
            message: 'Contraseña incorrecta. Intente nuevamente.',
          });
        }
      });
  });

  app.post('/register', async (req, res) => {
    let userData = req.body || JSON.parse(req.headers.data || '{}');
    const { username, email, password, confirmPassword } = userData;
    const isClient = getSession(req)?.activeProfile === PROFILES.CLIENT.name;

    if (existSession(req, res)) {
      if (isClient) {
        return res.send({
          message: `Ya has iniciado sesión. Cierra la sesión para continuar.`,
          redirect: '/home',
        });
      }
    }

    if (!username || !email || !password || !confirmPassword) {
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: 'Por favor llene todos los campos',
        userData,
      });
    }

    const usernameError = validator.validateUsername(username);
    const emailError = validator.validateEmail(email);
    const passwordError = validator.validatePassword(password);
    const confirmPasswordError = validator.validateConfirmPassword(
      password,
      confirmPassword
    );

    if (usernameError) {
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: usernameError,
      });
    }
    if (emailError) {
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: emailError,
      });
    }
    if (passwordError) {
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: passwordError,
      });
    }
    if (confirmPasswordError) {
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: confirmPasswordError,
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Copia el resto de los datos del body y reemplaza la contraseña
    userData = {
      status: 'active',
      register_date: new Date().toISOString(),
      ...userData,
      password: hashedPassword,
    };

    if (isClient || !userData.activeProfile) {
      userData.activeProfile = PROFILES.CLIENT.name;
    }

    createAndUpdateSession(req, userData);

    await fetch(`${SERVER_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userData.username,
        password: userData.password,
        email: userData.email,
        status: userData.status,
        register_date: userData.register_date,
      }),
    })
      .then(async (objuser) => {
        if (!objuser) {
          return res.status(ERROR_CODES.INTERNAL_SERVER_ERROR).send({
            errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Error al registrar usuario',
          });
        }
        try {
          const isSuccess = await repo.setUserProfile(
            userData.username,
            userData.activeProfile
          );

          if (isSuccess) {
            const loginObj = {
              username,
              password,
              activeProfile: userData.activeProfile,
            };

            await fetch(`${SERVER_URL}/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(loginObj),
            })
              .then((response) => response.text())
              .then((message) => res.send(message))
              .catch((error) => {
                console.error('Error al iniciar sesión:', error);
                res.status(ERROR_CODES.INTERNAL_SERVER_ERROR).send({
                  errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
                  message: 'Error al iniciar sesión',
                });
              });
          }
        } catch (error) {
          return res.status(ERROR_CODES.INTERNAL_SERVER_ERROR).send({
            errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Error al iniciar sesión',
          });
        }
      })
      .catch((error) => {
        console.error('Error al registrar usuario:', error);
        return res.status(ERROR_CODES.INTERNAL_SERVER_ERROR).send({
          errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: 'Error al registrar usuario',
        });
      });
  });

  app.get('/logout', async (req, res) => {
    if (!existSession(req)) {
      res.send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: 'No has iniciado sesión.',
        redirect: '/login',
      });
      return;
    }
    const result = destroySession(req);
    res.send(result);
  });

  app.post('/forgotPassword', async (req, res) => {
    // Validar el email que viene en los headers
    let userData = req.body || JSON.parse(req.headers.data || '{}');
    const { email } = userData;
    if (!email) {
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: 'Por favor ingrese su email',
      });
    }
    const emailError = validator.validateEmail(email);
    if (emailError) {
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: emailError,
      });
    }

    // Busca el usuario con ese email
    const data = await repo.getUsersWhere({ email });

    if (data?.length > 0) {
      // Si se encuentra el usuario, enviar un email con el token de recuperación
      if (data.length > 1) {
        return res.status(ERROR_CODES.BAD_REQUEST).send({
          errorCode: ERROR_CODES.BAD_REQUEST,
          message:
            'Se han encontrado múltiples usuarios con ese email. Por favor contacte al soporte.',
        });
      }
      const user = data[0];
      const token = tokenizer.generateToken({
        user,
        email: user.email,
        userId: user._id,
      });
      const origin = req.headers.origin;
      mailer.sendRecoveryEmail(user.email, token, origin);
      res.send({
        message:
          'Se ha enviado un correo de verificación a la dirección ingresada. Por favor, revise su correo y siga los pasos indicados.',
        token,
      });
    } else {
      res.status(ERROR_CODES.NOT_FOUND).send({
        errorCode: ERROR_CODES.NOT_FOUND,
        message:
          'No se ha encontrado un usuario con este correo. Por favor, verifique e intente nuevamente.',
      });
    }
  });

  app.post('/resetPassword', async (req, res) => {
    // Validar el token que viene en los headers
    let userData = req.body || JSON.parse(req.headers.data || '{}');
    const { token, password, confirmPassword } = userData;
    if (!token) {
      return res.status(ERROR_CODES.INTERNAL_SERVER_ERROR).send({
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Error del servidor al conseguir el token',
      });
    }

    const decoded = tokenizer.verifyToken(token);
    const { userId } = decoded || {};
    const dataUser = decoded?.user;

    if (!decoded) {
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: 'Token inválido o expirado. Por favor intente nuevamente',
      });
    }

    if (!password || !confirmPassword) {
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: 'Por favor llene todos los campos',
      });
    }

    const passwordError = validator.validatePassword(password);
    const confirmPasswordError = validator.validateConfirmPassword(
      password,
      confirmPassword
    );
    if (passwordError) {
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: passwordError,
      });
    }
    if (confirmPasswordError) {
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: confirmPasswordError,
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const updatedUser = { ...dataUser, password: hashedPassword };

    await dbms
      .query('/user/' + userId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: updatedUser.password }),
      })
      .then(() => {
        res.send({
          message: `Contraseña actualizada correctamente para el usuario ${updatedUser.username}. Por favor inicie sesión con su nueva contraseña.`,
          redirect: '/login',
        });
      })
      .catch((error) => {
        console.error('Error al actualizar la contraseña:', error);
        res.status(ERROR_CODES.INTERNAL_SERVER_ERROR).send({
          errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message:
            'Error al actualizar la contraseña. El email ingresado no está asociado a ningún usuario registrado.',
        });
      });
  });
};
