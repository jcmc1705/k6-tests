import { scenarios } from '../config/scenarios.js';
import { createSetupData } from '../lib/setup.js';
import { getIntegrationHistory } from '../endpoints/history.js';

export const options = scenarios.load;

export function setup() {
  return createSetupData();
}

export default function (data) {
  getIntegrationHistory(data.baseUrl, data.token);
}
