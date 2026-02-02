import http from 'k6/http';
import { check } from 'k6';
import { testData } from '../config/testData.js';

export function filterClasses(baseUrl, token) {
  const url = `${baseUrl}/classes/integration/edp`;
  const { userId, filter } = testData;

  const payload = JSON.stringify({
    ...filter,
    userId,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  };

  const response = http.post(url, payload, params);

  check(response, {
    'Filtro retornou sucesso': (res) => res.status === 200,
  });
}
