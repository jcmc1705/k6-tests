# Análise e melhorias de código – k6-tests SIAC

## 1. Resumo da análise

O projeto já tinha boa separação de pastas (config, auth, endpoints, tests). Foram identificados pontos de duplicação, configuração fixa e riscos que foram tratados nas melhorias abaixo.

---

## 2. Problemas identificados

### 2.1 Duplicação (DRY)

- **Problema:** Os 12 arquivos em `tests/` repetiam o mesmo bloco de imports (`environments`, `users`, `scenarios`, `generateToken`), as constantes `ENV` e `USER`, e a função `setup()` idêntica. A única variação era `options` (cenário) e a função do endpoint chamada.
- **Impacto:** Manutenção difícil, risco de divergência entre arquivos e mudanças em um só lugar exigindo alteração em 12 arquivos.

### 2.2 Configuração hardcoded

- **Problema:** `ENV = 'preview'` e `USER = 'admSenai'` estavam fixos em cada teste. Não havia como trocar ambiente ou usuário sem editar código.
- **Impacto:** Dificulta execução em HML, com outro usuário ou em pipelines (CI) com parâmetros por variável de ambiente.

### 2.3 Falha no login sem tratamento

- **Problema:** Em `auth/token.js`, mesmo quando o `check` de login falhava (status ≠ 200), o código seguia para `response.json()` e montagem do token, podendo gerar erro pouco claro.
- **Impacto:** Falha de autenticação não era sinalizada de forma explícita e poderia mascarar o motivo real do erro.

### 2.4 Dados de teste espalhados e inconsistentes

- **Problema:** `userId`, `schools`, `dr`, `course`, `finalDate`, etc. estavam hardcoded em vários endpoints. Em `filterClasses.js` havia `course: 'tecnico'` e `finalDate: '2028-12-31'`, enquanto em `importClasses.js` havia `course: 'tecni'` e `finalDate: '2030-12-13'`, além de ausência de `userId` em um e presença em outro.
- **Impacto:** Inconsistência entre fluxos (filtro x importação) e mudança de dados exigindo alteração em vários arquivos.

### 2.5 Segurança (recomendação)

- **Problema:** `config/users.js` contém senhas em texto plano no repositório.
- **Recomendação:** Para ambientes reais/CI, usar variáveis de ambiente (ex.: `__ENV.USERNAME`, `__ENV.PASSWORD`) e não versionar credenciais. O código já está preparado para receber `ENV` e `USER`; estender para credenciais via `__ENV` é o próximo passo se necessário.

---

## 3. Melhorias implementadas

### 3.1 Módulo de setup compartilhado (`lib/setup.js`)

- **O que foi feito:** Criada a função `createSetupData(envKey?, userKey?)`, que:
  - Usa `__ENV.ENV` e `__ENV.USER` quando não são passados argumentos (com defaults `preview` e `admSenai`).
  - Valida ambiente e usuário e lança erro claro se forem inválidos.
  - Gera o token e retorna `{ token, baseUrl }`.
- **Benefício:** Um único ponto de lógica de setup; testes só importam e chamam `createSetupData()`.

### 3.2 Testes refatorados para usar o setup compartilhado

- **O que foi feito:** Cada arquivo em `tests/` passou a:
  - Importar apenas `scenarios`, `createSetupData` e a função do endpoint.
  - Exportar `options = scenarios.load | scenarios.spike | scenarios.stress`.
  - Exportar `setup()` retornando `createSetupData()`.
  - Exportar `default function(data)` chamando o endpoint com `data.baseUrl` e `data.token`.
- **Benefício:** Menos linhas por arquivo, sem duplicação de setup e comportamento idêntico ao anterior.

### 3.3 Tratamento de falha no login (`auth/token.js`)

- **O que foi feito:** Após o `check`, o código verifica se o login foi bem-sucedido (`status === 200`). Caso contrário, lança `Error` com mensagem explicativa antes de acessar o body.
- **Benefício:** Falha de autenticação interrompe o teste de forma clara e evita erros obscuros ao parsear a resposta.

### 3.4 Dados de teste centralizados (`config/testData.js`)

- **O que foi feito:** Criado `config/testData.js` com:
  - `userId` (com suporte a `__ENV.TEST_USER_ID`).
  - `filter` (dr, schools, course, startDate, finalDate, shifts, className, modality).
  - `pagination` (page, pageSize, pageSizeList).
  - `historyType` e `historyItemsPerPage` para o endpoint de histórico.
- **O que foi feito nos endpoints:** `progress.js`, `filterClasses.js`, `history.js` e `importClasses.js` passaram a importar e usar `testData` em vez de valores fixos no código.
- **Benefício:** Um único lugar para alterar dados de teste; filtro e importação alinhados (ex.: mesmo `course` e `finalDate`).

---

## 4. Como usar ambiente e usuário configuráveis

Exemplo com variáveis de ambiente do k6:

```bash
# Preview com usuário padrão (admSenai)
k6 run tests/load.progress.test.js

# HML com usuário admSenaiHml
k6 run -e ENV=hml -e USER=admSenaiHml tests/load.progress.test.js

# userId customizado (quando suportado por testData)
k6 run -e ENV=preview -e USER=admSenai -e TEST_USER_ID=1234567 tests/load.progress.test.js
```

---

## 5. Estrutura atual (resumo)

```
k6-tests/
├── auth/
│   └── token.js          # Geração de token + falha explícita em caso de erro
├── config/
│   ├── environments.js
│   ├── scenarios.js
│   ├── .env.example
│   └── testData.js       # Novo: dados de teste centralizados
├── lib/
│   └── setup.js          # Novo: createSetupData() compartilhado
├── endpoints/
│   ├── filterClasses.js  # Usa testData
│   ├── history.js        # Usa testData
│   ├── importClasses.js  # Usa testData
│   └── progress.js       # Usa testData
└── tests/
    └── *.test.js         # Apenas cenário + setup compartilhado + endpoint
```

---

## 6. Sugestões futuras (não implementadas)

1. ~~**Credenciais via ambiente:**~~ **Implementado.** `config/users.js` foi removido; credenciais vêm apenas de variáveis de ambiente. Use `config/.env.example` como modelo e defina `K6_USERNAME` e `K6_PASSWORD` no `.env` ou com `-e`.
2. **Testes unitários:** Se o k6 for usado em conjunto com Node/JS para lógica auxiliar, considerar testes (ex.: Jest) para funções puras em `lib/` e `config/`.
3. **Thresholds em cenários:** Incluir `thresholds` em `scenarios.js` (ex.: `http_req_duration`, taxa de checks) para falhar o run quando os SLOs não forem atingidos.

---

**Documento gerado a partir da análise do código e das melhorias aplicadas. Objetivo: qualidade, correção, testabilidade e manutenção (alinhado às regras do projeto).**
