import { IUser } from "../database/models";
import { Request } from "express";

interface SessionData {
  username?: string;
}

export const createAndUpdateSession = (req: Request, data: SessionData) => {
  createSession(req, data);
};

export const createSession = (req: Request, data: SessionData) => {
  if (!req.session.data) {
    req.session.data = {};
  }
  req.session.data = { ...req.session.data, ...data };
};


export const destroySession = (
  req: Request
): { errorCode?: number; message: string } => {
  req.session.destroy((err) => {
    if (err) {
      return { errorCode: 500, message: "Error al cerrar sesión" };
    }
  });
  return { message: "Sesión cerrada correctamente" };
};

export const getSession = (req: Request): Partial<IUser> => {
  return req.session.data || {};
};

export const existSession = (req: Request): boolean => {
  if (req.session.data && Object.keys(req.session.data).length > 0) {
    return true;
  } else {
    return false;
  }
};
