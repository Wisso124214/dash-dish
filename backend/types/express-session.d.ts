import "express-session";
import { IUser } from "../components/database/models";

declare module "express-session" {
  interface SessionData {
    data: Partial<IUser>;
  }
}
