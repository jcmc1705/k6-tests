import { scenarios } from '../config/scenarios.js';
import { createSetupData } from '../lib/setup.js';
import { getImportProgress } from '../endpoints/progress.js';

export const options = scenarios.stress;

export function setup() {
  return createSetupData();
}

export default function (data) {
  getImportProgress(data.baseUrl, data.token);
}
