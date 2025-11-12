import bcrypt from "bcrypt";
import {
  createAndUpdateSession,
  destroySession,
  existSession,
} from "../../session/sessionManager.js";
import e from "express";
import config from "../../config/config.js";
import { User } from "../../database/models.js";
import { loginSchema, registerSchema } from "../../database/schemas.js";

export const createAuthRoutes = async (app: e.Express) => {
  const { ERROR_CODES } = config;

  app.post("/login", async (req, res) => {
    if (existSession(req)) {
      return res.send({
        message: `Ya has iniciado sesión. Cierra la sesión para continuar.`,
        redirect: "/home",
      });
    }

    // Validate with zod
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: firstError.message,
        errors: validationResult.error.issues,
      });
    }

    const { username, password } = validationResult.data;

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(ERROR_CODES.UNAUTHORIZED).send({
        errorCode: ERROR_CODES.UNAUTHORIZED,
        message: "Usuario o contraseña incorrectos.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(ERROR_CODES.UNAUTHORIZED).send({
        errorCode: ERROR_CODES.UNAUTHORIZED,
        message: "Usuario o contraseña incorrectos.",
      });
    }

    createAndUpdateSession(req, {
      username: user.username,
    });

    res.send({
      message: "Inicio de sesión exitoso.",
    });
  });

  app.post("/register", async (req, res) => {
    if (existSession(req)) {
      return res.send({
        message: `Ya has iniciado sesión. Cierra la sesión para continuar.`,
        redirect: "/home",
      });
    }

    // Validate with zod
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return res.status(ERROR_CODES.BAD_REQUEST).send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: firstError.message,
        errors: validationResult.error.issues,
      });
    }

    const { username, email, password } = validationResult.data;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(ERROR_CODES.CONFLICT).send({
        errorCode: ERROR_CODES.CONFLICT,
        message: "El nombre de usuario ya está en uso.",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(ERROR_CODES.CONFLICT).send({
        errorCode: ERROR_CODES.CONFLICT,
        message: "El correo electrónico ya está en uso.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });
    await newUser.save();

    createAndUpdateSession(req, {
      username: newUser.username,
      
    });

    res.send({
      message: "Registro exitoso.",
    });
  });

  app.get("/logout", async (req, res) => {
    if (!existSession(req)) {
      res.send({
        errorCode: ERROR_CODES.BAD_REQUEST,
        message: "No has iniciado sesión.",
        redirect: "/login",
      });
      return;
    }
    const result = destroySession(req);
    res.send(result);
  });
};
