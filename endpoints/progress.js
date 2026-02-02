import http from 'k6/http';
import { check } from 'k6';
import { testData } from '../config/testData.js';

export function getImportProgress(baseUrl, token) {
  const { userId, pagination } = testData;
  const url = `${baseUrl}/classes/integration/classes-processings?user_id=${userId}&page=${pagination.page}&page_size=${pagination.pageSize}`;

  const params = {
    headers: {
      Authorization: token,
    },
  };

  const response = http.get(url, params);

  check(response, {
    'Consulta de progresso retornou sucesso': (res) => res.status === 200,
  });
}
