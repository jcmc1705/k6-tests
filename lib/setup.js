/**
 * Setup compartilhado para todos os testes k6.
 * Ambiente e credenciais vêm de variáveis de ambiente (__ENV).
 *
 * Credenciais (uma das formas):
 * 1) Por key: USER=ADM_SENAI → username em __ENV.ADM_SENAI, senha em PASSWORD_PREVIEW ou PASSWORD_HML (conforme ENV).
 * 2) Direto: K6_USERNAME e K6_PASSWORD.
 *
 * Uso por key: source config/.env && k6 run -e USER=ADM_SENAI tests/load.progress.test.js
 * Uso direto:  k6 run -e K6_USERNAME=cpf -e K6_PASSWORD=senha tests/load.progress.test.js
 */

import { environments } from '../config/environments.js';
import { generateToken } from '../auth/token.js';

const DEFAULT_ENV = 'preview';

/**
 * Resolve credenciais: por key (USER) ou por K6_USERNAME/K6_PASSWORD.
 * Key: USER=ADM_SENAI usa __ENV.ADM_SENAI como username e PASSWORD_PREVIEW/PASSWORD_HML conforme ENV.
 */
function resolveCredentials(env) {
  const userKey = __ENV.USER;
  if (userKey && __ENV[userKey]) {
    const username = __ENV[userKey];
    const password = env === 'hml' ? __ENV.PASSWORD_HML : __ENV.PASSWORD_PREVIEW;
    if (password !== undefined && password !== '') {
      return { username, password };
    }
  }
  return {
    username: __ENV.K6_USERNAME,
    password: __ENV.K6_PASSWORD,
  };
}

/**
 * Cria o contexto de execução (token + baseUrl) para os testes.
 * @param {string} [envKey] - Chave do ambiente (ex: 'preview', 'hml'). Usa __ENV.ENV ou default.
 * @returns {{ token: string, baseUrl: string }}
 */
export function createSetupData(envKey) {
  const env = envKey || __ENV.ENV || DEFAULT_ENV;
  const envConfig = environments[env];

  if (!envConfig) {
    throw new Error(`Ambiente inválido: "${env}". Disponíveis: ${Object.keys(environments).join(', ')}`);
  }

  const { username, password } = resolveCredentials(env);

  if (username === undefined || username === '') {
    throw new Error(
      'Defina credenciais: USER=ADM_SENAI (e PASSWORD_PREVIEW no .env) ou K6_USERNAME/K6_PASSWORD. Veja config/.env.example.'
    );
  }
  if (password === undefined) {
    throw new Error(
      'Defina senha: PASSWORD_PREVIEW (ou PASSWORD_HML) no .env ao usar USER, ou K6_PASSWORD. Veja config/.env.example.'
    );
  }

  const token = generateToken({
    authUrl: envConfig.authUrl,
    username,
    password,
  });

  return {
    token,
    baseUrl: envConfig.baseUrl,
  };
}
