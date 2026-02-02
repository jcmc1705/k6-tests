import http from 'k6/http';
import { check } from 'k6';
import { testData } from '../config/testData.js';

export function getIntegrationHistory(baseUrl, token) {
  const { pagination, historyType, historyItemsPerPage } = testData;
  const url = `${baseUrl}/sge-import-history/filter/by-type?page=${pagination.page}&itemsPerPage=${historyItemsPerPage}&type=${historyType}`;

  const params = {
    headers: {
      Authorization: token,
    },
  };

  const response = http.get(url, params);

  check(response, {
    'status é 200': (res) => res.status === 200,
  });
}
