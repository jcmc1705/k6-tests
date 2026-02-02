import { scenarios } from '../config/scenarios.js';
import { createSetupData } from '../lib/setup.js';
import { filterClasses } from '../endpoints/filterClasses.js';

export const options = scenarios.load;

export function setup() {
  return createSetupData();
}

export default function (data) {
  filterClasses(data.baseUrl, data.token);
}
