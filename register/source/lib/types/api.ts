import { Role } from "./role.js";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  session_id: string;
  role: Role;
}