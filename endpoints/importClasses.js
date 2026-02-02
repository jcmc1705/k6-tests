import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';
import { testData } from '../config/testData.js';

export const importClassesRequests = new Counter('import_classes_requests_total');
export const importClassesSkipped = new Counter('import_classes_skipped_no_data_total');

export function importClasses(baseUrl, token) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: token,
  };

  const filterUrl = `${baseUrl}/classes/integration/edp`;
  const { filter, pagination } = testData;

  const filterPayload = JSON.stringify(filter);

  http.post(filterUrl, filterPayload, {
    headers,
    tags: { name: 'apply_filter' },
    expected_response: false,
  });

  const listUrl = `${baseUrl}/classes/integration/edp?page=${pagination.page}&page_size=${pagination.pageSizeList}`;

  const listRes = http.get(listUrl, {
    headers,
    tags: { name: 'list_classes' },
  });

  check(listRes, {
    'LISTAGEM – turmas retornadas com sucesso': (r) => r.status === 200,
  });

  const listBody = listRes.json();
  const classIds =
    listBody?.data?.map((item) => item._id).filter(Boolean) || [];

  if (classIds.length === 0) {
    importClassesSkipped.add(1);

    check(null, {
      'IMPORTAÇÃO – nenhuma turma disponível para importar': () => true,
    });

    return;
  }

  const importUrl = `${baseUrl}/classes/integration/edp/import`;

  const importPayload = JSON.stringify({
    classes: classIds,
  });

  const importRes = http.post(importUrl, importPayload, {
    headers,
    tags: { name: 'import_classes' },
    expected_response: (r) =>
      r.status === 200 ||
      r.status === 201 ||
      r.status === 202 ||
      r.status === 409,
  });

  importClassesRequests.add(1);

  check(importRes, {
    'IMPORTAÇÃO – endpoint /import foi executado': (r) =>
      [200, 201, 202, 409].includes(r.status),
  });
}
