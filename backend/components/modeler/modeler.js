import { models } from './models.js';
import { special_plurals } from './models.js';

export default class Modeler {
  constructor() {
    this.models = { ...models };
    this.special_plurals = { ...special_plurals };
  }

  getModels() {
    return this.models;
  }

  getSpecialPlurals() {
    return this.special_plurals;
  }
}
