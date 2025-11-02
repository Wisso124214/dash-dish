import { SERVER_URL } from '../../../config';

export interface ValidationValues {
  user: {
    username: { min: number; max: number };
    email: { max: number };
    password: { min: number; max: number };
  };
}

export const validationValues: ValidationValues = {
  user: {
    username: { min: 6, max: 30 },
    email: { max: 100 },
    password: { min: 8, max: 80 },
  },
};

export async function validateUsername(value: string): Promise<string> {
  if (!value || value.length === 0) {
    return 'El nombre de usuario es obligatorio.';
  } else if (value.length < validationValues.user.username.min) {
    return `El nombre de usuario debe tener al menos ${validationValues.user.username.min} caracteres.`;
  } else if (value.length > validationValues.user.username.max) {
    return `El nombre de usuario no puede tener más de ${validationValues.user.username.max} caracteres.`;
  }

  const res = await fetch(`${SERVER_URL}/users`, { method: 'GET' });
  const users: { username: string }[] = await res.json();
  const userExists = users.some((user) => user.username === value);
  if (userExists) {
    return 'El nombre de usuario ya está en uso.';
  }
  return '';
}

export async function validateEmail(email: string): Promise<string> {
  if (!email || email.length === 0) {
    return 'El email es obligatorio.';
  } else if (email.length > validationValues.user.email.max) {
    return `El email no puede tener más de ${validationValues.user.email.max} caracteres`;
  }

  const emailRegex =
    /^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,5}$/;
  if (!emailRegex.test(email)) {
    return 'El email no es válido';
  }

  const res = await fetch(`${SERVER_URL}/users`, { method: 'GET' });
  const users: { email: string }[] = await res.json();
  const emailInUse = users.some((user) => user.email === email);
  if (emailInUse) {
    return 'El email ya está en uso.';
  }
  return '';
}

export function validatePassword(text: string): string {
  if (text.length > validationValues.user.password.max) {
    return `La contraseña no puede tener más de ${validationValues.user.password.max} caracteres`;
  }

  const length = text.length >= validationValues.user.password.min;
  const numberRegex = /[0-9]/;
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const symbolRegex = /[-:+_º·$/[\]}{|~€|@#~€¬`«»%()?¿¡;.'"!@#\\$/%^,&*]/;

  if (text.length > 0) {
    if (!length) {
      return 'La contraseña debe tener al menos 8 caracteres';
    } else if (!uppercaseRegex.test(text)) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    } else if (!lowercaseRegex.test(text)) {
      return 'La contraseña debe contener al menos una letra minúscula';
    } else if (!numberRegex.test(text)) {
      return 'La contraseña debe contener al menos un número';
    } else if (!symbolRegex.test(text)) {
      return 'La contraseña debe contener al menos un símbolo';
    }
  }
  return '';
}

export function validateConfirmPassword(
  pass: string,
  confirmPass: string
): string {
  if (pass !== confirmPass) {
    return 'Las contraseñas no coinciden';
  }
  return '';
}
