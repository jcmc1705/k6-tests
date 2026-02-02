import { scenarios } from '../config/scenarios.js';
import { createSetupData } from '../lib/setup.js';
import { getImportProgress } from '../endpoints/progress.js';

export const options = scenarios.load;

export function setup() {
  return createSetupData();
}

export default function (data) {
  getImportProgress(data.baseUrl, data.token);
}
