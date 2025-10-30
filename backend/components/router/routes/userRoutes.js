import axios from 'axios';
import bcrypt from 'bcrypt';
import Config from '../../config/config.js';
import jwt from 'jsonwebtoken';

const secretKey = 'abcde12345';
let tokens = []; // Array to store tokens
let info = {
  infoUsers: [],
};

const config = new Config().getConfig();
const { SERVER_URL } = config;

// Función auxiliar para validar el token y cerrar sesión si es inválido
async function validateTokenAndCloseSessionIfInvalid(req, res) {
  const token =
    req.headers['authorization'] || req.body?.token || req.query?.token;
  if (!token) {
    res.status(400).json({ message: 'Token is required' });
    return false;
  }
  try {
    const result = await axios.get(`${SERVER_URL}/is-valid-token`, {
      headers: { authorization: token },
      body: { token },
    });
    if (!result.data.isValid) {
      // Cierra sesión si el token no es válido
      const id_user =
        req.body?.id_user ||
        req.query?.id_user ||
        req.body?.username ||
        req.query?.username;
      if (id_user) {
        await axios.post(`${SERVER_URL}/close-session`, { id_user });
      }
      res
        .status(401)
        .json({ isValid: false, message: 'Invalid token. Session closed.' });
      return false;
    }
    return true;
  } catch (error) {
    res
      .status(401)
      .json({ isValid: false, message: 'Invalid token. Session closed.' });
    return false;
  }
}

export const createUserRoutes = async (app) => {
  app.get('/encrypt-data', async (req, res) => {
    const { data } = req.query || req.body;

    if (!data) {
      return res
        .status(400)
        .json({ message: 'Data is required for encryption' });
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds); // Genera un salt
    const encryptedData = bcrypt.hashSync(data, salt); // Cifra los datos con el salt
    res.json({ encryptedData }); // Devuelve los datos cifrados
  });

  app.get('/get-id-session', async (req, res) => {
    const { id_user } = req.body || req.query; // Obtiene el ID del usuario de los parámetros de la consulta

    const strId = await axios
      .get(`${SERVER_URL}/sessions`, {
        params: {
          id_user: id_user, // Pasa el ID del usuario como parámetro
        },
      })
      .then(async (axiosRes) => {
        await axiosRes.data.forEach((objsession) => {
          // Busca una sesión que coincida con el usuario y dispositivo
          if (
            objsession.id_user === id_user
            // && objsession.id_device === id_device
          ) {
            return objsession._id; // Asigna el ID de la sesión
          }
        });
      })
      .catch((error) => {
        handleError(error, 'Error setting session'); // Maneja errores
        res.status(500).json({ message: error.message, error });
      });

    res.json({ id: strId }); // Devuelve el ID de la sesión
  });

  app.post('/create-session', async (req, res) => {
    let strId = '';
    const { id_user } = req.body || req.query;

    if (!id_user) {
      handleError(
        new Error('id_user is required'),
        'Error creating session. No id_user available'
      ); // Maneja errores
      return res.status(400).json({ message: 'id_user is required' });
    }

    await axios
      .post(`${SERVER_URL}/session`, {
        id_user,
        session_state: 'open',
        date: new Date(), // Fecha actual
      })
      .then(async (id_session_res) => {
        strId = id_session_res.data._id; // Actualiza el ID de la sesión
        return res.json({ id: strId }); // Devuelve el ID de la sesión
      })
      .catch((error) => {
        handleError(error, 'Error setting session'); // Maneja errores
        return res.status(500).json({ message: error.message, error });
      });
  });

  app.put('/put-set-session', async (req, res) => {
    let strId = '';
    const { id_user, session_state, id_session } = req.body || req.query;

    if (!id_user || !session_state || !id_session) {
      handleError(
        new Error('id_user, state, and id_session are required'),
        'Error setting session'
      ); // Maneja errores
      return res
        .status(400)
        .json({ message: 'id_user, state, and id_session are required' });
    }

    const date_4 = new Date(); // Obtiene la fecha actual
    date_4.setHours(date_4.getHours() - 4); // Ajusta la hora a GMT-4

    const objsession = {
      // id_device: id_device, // ID del dispositivo
      id_user: id_user, // ID del usuario
      session_state: session_state, // Estado de la sesión
      date: date_4, // Fecha ajustada
    };

    if (id_session === '') {
      // Si no hay ID de sesión, crea una nueva
      await axios
        .post(`${SERVER_URL}/session`, objsession)
        .then((axiosRes) => {
          strId = axiosRes.data._id; // Asigna el ID de la nueva sesión
        })
        .catch((error) => {
          handleError(error, 'Error setting session'); // Maneja errores
          res.status(500).json({ message: error.message, error });
        });
    } else {
      // Si hay ID de sesión, actualiza la existente
      await axios
        .put(`${SERVER_URL}/session/${id_session}`, objsession)
        .catch((error) => {
          handleError(error, 'Error setting session'); // Maneja errores
          res.status(500).json({ message: error.message, error });
        });
      strId = id_session; // Asigna el ID de la sesión existente
    }
    res.json({ id: strId }); // Devuelve el ID de la sesión
  });

  app.post('/register', async (req, res) => {
    const { username, password, email } = req.body || req.query;

    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ message: 'Username, password, and email are required' });
    }

    const hashedPassword = await axios
      .get(`${SERVER_URL}/encrypt-data`, {
        params: { data: password },
      })
      .then((response) => response.data.encryptedData)
      .catch((error) => {
        handleError(error, 'Error encrypting password'); // Maneja errores
        res.status(500).json({ message: error.message, error });
      });

    await axios
      .post(`${SERVER_URL}/user`, {
        username: username, // Nombre de usuario
        password: hashedPassword, // Contraseña cifrada
        email,
        register_date: new Date(), // Fecha de registro
        profile: 'user', // Tipo de usuario
      })
      .then(async (objuser) => {
        await axios
          .post(`${SERVER_URL}/create-session`, {
            id_user: objuser.data._id,
          })
          .then(async (objsession) => {
            await axios.put(`${SERVER_URL}/user/${objuser.data._id}`, {
              id_session: objsession.data.id, // Actualiza el ID de sesión del usuario
            });

            const dataUser = await axios
              .post(`${SERVER_URL}/post-data-user`, {
                username,
                email,
                profile: 'user', // Tipo de usuario (admin o user)
                id_user: objuser.data._id, // ID del usuario
              })
              .then((resp) => resp.data)
              .catch((error) => {
                handleError(error, 'Error creating token'); // Maneja errores
                return res.status(500).json({ message: error.message, error });
              });

            res.json({
              ...dataUser,
              success: true,
              message: 'User registered successfully',
              userId: objuser.data._id,
              sessionId: objsession.data.id,
            });
          })
          .catch((error) => {
            handleError(error, 'Error creating sessionn'); // Maneja errores
            res.status(500).json({ message: error.message, error });
          });
      })
      .catch((error) => {
        handleError(error, 'Error posting user'); // Maneja errores
        res.status(500).json({ message: error.message, error });
      });
  });

  app.post('/logout', async (req, res) => {
    const { id_user } = req.body || req.query; // Obtiene el ID del usuario de los parámetros de la consulta

    if (!id_user) {
      handleError(new Error('id_user is required'), 'Error closing session'); // Maneja errores
      return res.status(400).json({ message: 'id_user is required' });
    }

    // Con el id_user obtiene el registro de user y extrae el id_session en este registro
    await axios
      .get(`${SERVER_URL}/user/${id_user}`)
      .then(async (objUser) => {
        const id_session = objUser.data.id_session; // Obtiene el ID de la sesión del usuario

        if (!id_session) {
          handleError(
            new Error('No session found for this user'),
            'Error closing session'
          ); // Maneja errores
          return res
            .status(404)
            .json({ message: 'No session found for this user' });
        }

        const newDate = new Date(); // Obtiene la fecha actual
        newDate.setHours(newDate.getHours() - 4); // Ajusta la hora a GMT-4

        // Con el id_session se modifica (put) el session_state a closed
        await axios
          .put(`${SERVER_URL}/session/${id_session}`, {
            session_state: 'closed',
            date: newDate, // Fecha ajustada
          })
          .then(() => {
            res.json({ message: 'Session closed successfully' });
          })
          .catch((error) => {
            handleError(error, 'Error closing session'); // Maneja errores
            res.status(500).json({ message: error.message, error });
          });
      })
      .catch((error) => {
        handleError(error, 'Error getting user'); // Maneja errores
        res.status(500).json({ message: error.message, error });
      });
  });

  app.post('/login', async (req, res) => {
    const { username, password } = req.body || req.query;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username and password are required' });
    }

    await axios
      .get(`${SERVER_URL}/get-users`)
      .then(async (response) => {
        const users = response.data;
        const user = users.find((u) => u.username === username);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Si la contraseña es correcta, setea la sesión
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid password' });
        }

        const id_session = await axios
          .get(`${SERVER_URL}/get-id-session`, {
            params: { id_user: user._id }, // Pasa el ID del usuario como parámetro
          })
          .then((response) => response.data.id)
          .catch((error) => {
            handleError(error, 'Error getting session ID'); // Maneja errores
            return res.status(500).json({ message: error.message, error });
          });

        if (id_session === '') {
          return res.status(404).json({ message: 'Session not found' });
        }

        await axios
          .put(`${SERVER_URL}/put-set-session`, {
            session_state: 'open', // Estado de la sesión
            id_user: user._id, // ID del usuario
            id_session: user.id_session || id_session, // ID de la sesión
          })
          .then(async () => {
            const dataUser = await axios
              .post(`${SERVER_URL}/post-data-user`, {
                username: user.username,
                email: user.email,
                profile: user.profile, // Tipo de usuario (admin o user)
                id_user: user._id, // ID del usuario
              })
              .then((resp) => resp.data)
              .catch((error) => {
                handleError(error, 'Error creating token'); // Maneja errores
                return res.status(500).json({ message: error.message, error });
              });

            res.json({
              ...dataUser,
              success: true,
              message: 'Login successful',
              userId: user._id,
              sessionId: id_session,
            });
          })
          .catch((error) => {
            handleError(error, 'Error updating session'); // Maneja errores
            return res.status(500).json({ message: error.message, error });
          });
      })
      .catch((error) => {
        handleError(error, 'Error getting users'); // Maneja errores
        return res.status(500).json({ message: error.message, error });
      });
  });

  app.post('/post-data-user', async (req, res) => {
    const { username, email, profile, id_user } = req.body || req.query;

    if (!username || !email || !profile || !id_user) {
      return res.status(400).json({ message: 'Missing required data' });
    }

    const token = await axios
      .get(`${SERVER_URL}/create-token`, {
        params: {
          username,
          email,
          profile, // Tipo de usuario (admin o user)
        },
      })
      .then((tokenResponse) => tokenResponse.data.token)
      .catch((error) => {
        handleError(error, 'Error creating token'); // Maneja errores
        return res.status(500).json({ message: error.message, error });
      });

    const infoUser = await axios
      .post(`${SERVER_URL}/post-info-user`, {
        username,
        id_user,
        token,
        email,
        profile,
      })
      .then((response) => response.data)
      .catch((error) => {
        handleError(error, 'Error posting user info'); // Maneja errores
        return res.status(500).json({ message: error.message, error });
      });

    res.json({
      ...infoUser,
      success: true,
      message: 'Data user posted successfully',
    });
  });

  app.get('/create-token', async (req, res) => {
    const { username, email, profile } = req.query || req.body;

    if (!username || !email || !profile) {
      return res
        .status(410)
        .json({ message: 'Username, email, and profile are required' });
    }
    const token = jwt.sign({ username, email, profile }, secretKey, {
      expiresIn: '1h',
    });
    res.json({ token }); // Devuelve el token en formato JSON
  });

  app.get('/verify-token', async (req, res) => {
    if (!(await validateTokenAndCloseSessionIfInvalid(req, res))) return;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    try {
      const decoded = jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          console.error('Token verification error:', err);
          handleError(err, 'Error verifying token'); // Maneja errores
          return res
            .status(401)
            .json({ valid: false, message: 'Invalid token' });
        }
        return decoded;
      });
      res.json({ valid: true, decoded });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ valid: false, message: 'Invalid token' });
    }
  });

  app.get('/is-valid-token', async (req, res) => {
    if (!(await validateTokenAndCloseSessionIfInvalid(req, res))) return;
    const { token } = req.body || req.query;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    try {
      jwt.verify(token, secretKey);
      res.json({ isValid: true });
    } catch (error) {
      console.error('Token verification error:', error);
      handleError(error, 'Error verifying token'); // Maneja errores
      res.status(401).json({
        isValid: false,
        message: 'Invalid token. Please login again.',
      });
    }
  });

  app.get('/token-dispatcher', async (req, res) => {
    const { username } = req.body || req.query;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const userToken = tokens.find((tokenObj) => tokenObj[username]);
    if (!userToken) {
      return res.status(404).json({ message: 'Token not found for this user' });
    }

    setTimeout(
      () => {
        tokens = tokens.filter((tokenObj) => !tokenObj[username]);
      },
      5 * 60 * 1000
    ); // Elimina el token después de 5 minutos

    res.json({ token: userToken[username] });
  });

  app.post('/post-info-user', async (req, res) => {
    const { username } = req.body || req.query;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    let newInfo = { [username]: { ...req.body } };

    // Si el usuario ya existe, actualiza la información
    if (info.infoUsers[username]) {
      newInfo = { [username]: { ...info.infoUsers[username], ...req.body } };
    }

    info.infoUsers = {
      ...info.infoUsers,
      ...newInfo,
    };

    res.json({
      message: 'User info updated successfully',
      infoUsers: info.infoUsers,
    });
  });

  app.get('/info', async (req, res) => {
    if (Object.keys(info).length === 0) {
      return res.status(404).json({ message: 'No info available' });
    }
    res.json(info);
  });

  app.post('/info', async (req, res) => {
    const thisInfo = JSON.parse(req.body.info || req.query.info || '{}');
    if (!thisInfo || typeof thisInfo !== 'object') {
      return res.status(400).json({
        message:
          'The data sent must be an object converted to string in a property called info',
      });
    }

    // Actualiza la información global
    info = { ...info, ...thisInfo };
    res.json({ message: 'Info updated successfully', info });
  });

  app.post('/get-info-user', async (req, res) => {
    const { username } = req.body || req.query;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Buscar el usuario en info.infoUsers
    const userInfo = info.infoUsers[username];
    if (!userInfo) {
      return res.status(404).json({ message: 'User info not found' });
    }

    res.json(userInfo);
  });
};

const handleError = (error, message) => {
  // console.error(error);
  console.error(
    // error, '\n',
    error.message,
    '\n',
    error.path,
    '\n',
    error.response ? error.response.data : '',
    '\n',
    error.response ? error.response.status : '',
    '\n',
    error.request ? error.request.path : '',
    '\n',
    error.request ? error.request.method : '',
    '\n',
    message,
    '\n'
  );
  // throw new Error(`${message}: ${error.message}`);
};
