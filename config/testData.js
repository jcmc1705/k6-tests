/**
 * Dados de teste usados pelos endpoints.
 * Centraliza valores como userId, schools e filtros para evitar duplicação e inconsistência.
 *
 * Em produção/CI, considere usar variáveis de ambiente (__ENV) para userId e schools.
 */

export const testData = {
  /** ID do usuário usado nas requisições (ex.: progresso, filtros). */
  userId: __ENV.TEST_USER_ID || 6513396,

  /** DR e escolas usadas nos filtros de turmas. */
  filter: {
    dr: 'AL',
    schools: [1117346, 4187741],
    course: 'tecnico',
    startDate: '2016-01-01',
    finalDate: '2028-12-31',
    shifts: [],
    className: '',
    modality: '',
  },

  /** Paginação padrão. */
  pagination: {
    page: 1,
    pageSize: 10,
    pageSizeList: 20,
  },

  /** Histórico: tipo de importação. */
  historyType: 'import_success',
  historyItemsPerPage: 20,
};
