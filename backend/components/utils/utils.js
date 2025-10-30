export default class Services {
  constructor() {}

  toUpperCaseFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  getAllDinamicMethodNames = (thisArg) =>
    Object.keys(thisArg).filter(
      (method) => typeof thisArg[method] === 'function'
    );

  handleError({ message, errorCode, error = {} }) {
    throw new Error(JSON.stringify({ message, errorCode, error }));
  }
}
