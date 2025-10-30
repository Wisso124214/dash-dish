import Config from '../config/config.js';
import DBMS from '../dbms/dbms.js';

export default class Validator {
  constructor() {
    this.dbms = new DBMS();
    const customTypes = new Config().getCustomTypes();

    if (!Validator.instance) {
      this.types = {
        array: (value) => Array.isArray(value),
        int: (value) => Number.isInteger(value),
        float: (value) => Number(value) === value && !Number.isInteger(value),
        string: (value) => typeof value === 'string',
        boolean: (value) => typeof value === 'boolean',
        date: (value) => value instanceof Date,
        object: (value) => typeof value === 'object' && value !== null,
        function: (value) => typeof value === 'function',
        number: (value) => typeof value === 'number',
        strings_array: (value) =>
          Array.isArray(value) &&
          value.every((item) => typeof item === 'string'),
        object_of_strings: (value) =>
          value !== null &&
          typeof value === 'object' &&
          Object.values(value).every((item) => typeof item === 'string'),
        object_of_strings_array: (value) =>
          value !== null &&
          typeof value === 'object' &&
          Object.values(value).every(
            (item) =>
              Array.isArray(item) &&
              item.every((subItem) => typeof subItem === 'string')
          ),
        array_of_objects: (value) =>
          Array.isArray(value) &&
          value.every((item) => item !== null && typeof item === 'object'),
        object_of_arrays: (value) =>
          value !== null &&
          typeof value === 'object' &&
          Object.values(value).every((item) => Array.isArray(item)),
        ...customTypes,
      };

      this.validationValues = {
        user: {
          username: { min: 6, max: 30 },
          email: { max: 100 },
          password: { min: 8, max: 80 },
        },
        profile: {
          name: { min: 3, max: 30 },
          description: { max: 300 },
        },
        subsystem: {
          name: { min: 3, max: 50 },
          description: { max: 300 },
        },
        class: {
          name: { min: 3, max: 30 },
          description: { max: 200 },
        },
        method: {
          name: { min: 3, max: 30 },
          description: { max: 200 },
        },
        menu: {
          name: { min: 3, max: 50 },
          description: { max: 200 },
        },
        option: {
          name: { min: 3, max: 80 },
          description: { max: 200 },
        },
        transaction: {
          description: { max: 200 },
        },
      };

      Validator.instance = this;
    }
    return Validator.instance;
  }

  validateUsername(value) {
    if (!value || value.length === 0) {
      return 'El nombre de usuario es obligatorio.';
    } else if (
      value &&
      value.length < this.validationValues.user.username.min &&
      value.length > 0
    ) {
      return `El nombre de usuario debe tener al menos ${this.validationValues.user.username.min} caracteres.`;
    } else if (
      value &&
      value.length > this.validationValues.user.username.max
    ) {
      return `El nombre de usuario no puede tener más de ${this.validationValues.user.username.max} caracteres.`;
    }

    let userExists = false;

    this.dbms
      .query('/users', {
        method: 'GET',
      })
      .then((users) => {
        userExists = users.some((user) => user.username === value);
        if (userExists) {
          return 'El nombre de usuario ya está en uso.';
        } else {
          return '';
        }
      });
  }

  validateEmail(email) {
    // Chequear que el email tenga un formato válido

    if (!email || email.length === 0) {
      return 'El email es obligatorio.';
    } else if (email && email.length > this.validationValues.user.email.max) {
      return `El email no puede tener más de ${this.validationValues.user.email.max} caracteres`;
    }

    const emailRegex = new RegExp(
      '[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,5}'
    );

    if (email && email.length > 0 && !emailRegex.test(email)) {
      return 'El email no es válido';
    }

    let emailInUse = false;

    this.dbms
      .query('/users', {
        method: 'GET',
      })
      .then((users) => {
        emailInUse = users.some((user) => user.email === email);
        if (emailInUse) {
          return 'El email ya está en uso..';
        } else {
          return '';
        }
      });
  }

  validatePassword(text) {
    // Chequear que la contraseña tenga al menos 8 caracteres
    // Chequear que la contraseña tenga al menos una mayúscula, una minúscula, un número y un carácter especial

    if (text && text.length > this.validationValues.user.password.max) {
      return `La contraseña no puede tener más de ${this.validationValues.user.password.max} caracteres`;
    }

    let errorText = '';
    const length = text.length > this.validationValues.user.password.min;
    const numberRegex = new RegExp('[0-9]');
    const uppercaseRegex = new RegExp('[A-Z]');
    const lowercaseRegex = new RegExp('[a-z]');
    const symbolRegex =
      /[-:+_º·$/[\]}{|~€|@#~€¬`«»%()?¿¡;.'"!@#\\$//%\\^,&\\*]/;

    if (text.length > 0) {
      if (!length) {
        errorText = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!uppercaseRegex.test(text)) {
        errorText = 'La contraseña debe contener al menos una letra mayúscula';
      } else if (!lowercaseRegex.test(text)) {
        errorText = 'La contraseña debe contener al menos una letra minúscula';
      } else if (!numberRegex.test(text)) {
        errorText = 'La contraseña debe contener al menos un número';
      } else if (!symbolRegex.test(text)) {
        errorText = 'La contraseña debe contener al menos un símbolo';
      } else {
        errorText = '';
      }
    }
    return errorText;
  }

  validateConfirmPassword(pass, confirmPass) {
    // Chequear que la contraseña de confirmación sea igual a la contraseña

    if (pass !== confirmPass) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  getValidationValues(entity, field) {
    return this.validationValues[entity][field];
  }

  validateName(value, entity) {
    const { min, max } = this.getValidationValues(entity, 'name');

    if (value && value.length < min && value.length > 0) {
      return `El nombre de ${entity} debe tener al menos ${min} caracteres.`;
    } else if (value && value.length > max) {
      return `El nombre de ${entity} no puede tener más de ${max} caracteres.`;
    }
    return '';
  }

  validateDescription(value, entity) {
    const { max } = this.getValidationValues(entity, 'description');
    if (value && value.length > max) {
      return `La descripción de ${entity} no puede tener más de ${max} caracteres.`;
    }
    return '';
  }

  validateStructuredData(data, structure) {
    // Iterate over structure recursively until find a string and validate it
    /**If the root property is found, instead of looking for a property named root, validate the entire object since root is found. */
    const errors = [];

    if (structure.hasOwnProperty('root')) {
      const isValid = this.validateField(data, structure.root);
      if (!isValid) {
        const types = structure.root.split('_of_');
        const structureType = types ? types[0] : 'estructura';
        const expectedType = types ? types[1] : '(no especificado)';
        errors.push(
          `Error, todos los campos del ${structureType} deben ser de tipo ${expectedType}`
        );
      }
      return errors;
    }

    const validate = (data, structure) => {
      for (const key in structure) {
        if (structure.hasOwnProperty(key)) {
          const type = structure[key];
          const value = data[key];

          if (typeof type === 'string') {
            const isValid = this.validateField(value, type);
            if (!isValid) {
              errors.push(`Error, ${key} debe ser de tipo ${type}`);
            }
          } else if (typeof type === 'object') {
            // If the type is an object, recurse into it
            validate(value, type);
          }
        }
      }
    };
    validate(data, structure);
    return errors;
  }

  validateField(value, type) {
    const typeValidator = this.types[type];
    if (typeValidator) {
      return typeValidator(value);
    }
    return '';
  }
}
