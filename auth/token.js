import http from 'k6/http';
import { check } from 'k6';

export function generateToken({ authUrl, username, password }) {

  const headers = { 'Content-Type': 'application/json' };

  const body = JSON.stringify({
    username,
    password,
  });

  const response = http.post(authUrl, body, { headers });

  const loginOk = check(response, {
    'Login foi bem-sucedido': (res) => res.status === 200,
  });

  if (!loginOk || response.status !== 200) {
    throw new Error(
      `Falha no login: status ${response.status}. Verifique credenciais e ambiente.`
    );
  }

  const responseJson = response.json();
  const token = `${responseJson.token_type} ${responseJson.access_token}`;

  return token;
}
