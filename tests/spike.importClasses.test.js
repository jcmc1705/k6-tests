import { scenarios } from '../config/scenarios.js';
import { createSetupData } from '../lib/setup.js';
import { importClasses } from '../endpoints/importClasses.js';

export const options = scenarios.spike;

export function setup() {
  return createSetupData();
}

export default function (data) {
  importClasses(data.baseUrl, data.token);
}
