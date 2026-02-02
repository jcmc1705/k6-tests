# 📊 Projeto de Testes de Performance – k6 (SIAC)

## 📌 Visão Geral

Este repositório contém a estrutura de testes de performance desenvolvida em **k6** para validação de endpoints do **SIAC**, com foco especial no fluxo de **importação de turmas via integração SGE**.

Os testes foram organizados seguindo boas práticas de QA e performance testing, garantindo:

* Separação clara de responsabilidades
* Reutilização de autenticação
* Suporte a múltiplos ambientes
* Execução de cenários de **load**, **spike** e **stress**
* Métricas funcionais e técnicas visíveis no relatório

---

## 🚀 Como usar

**Pré-requisito:** [k6](https://k6.io/docs/get-started/installation/) instalado.

1. **Executar um teste**  
   `k6 run tests/<cenário>.<endpoint>.test.js`  
   Cenários: `load`, `spike`, `stress`. Endpoints: `progress`, `history`, `filterClasses`, `importClasses`.

2. **Credenciais** – Defina no ambiente (obrigatório). Duas formas:
   * **Por key:** no `.env` defina as keys (ex.: `ADM_SENAI`, `PASSWORD_PREVIEW`) com `export` em cada linha (ou use `set -a` antes do `source`). Depois rode com `USER=nome_da_key`:
     ```bash
     set -a && source config/users.env && set +a && k6 run -e USER=ADM_SENAI tests/load.progress.test.js
     ```
     O setup usa o valor da key como username (ex.: `ADM_SENAI` → CPF) e a senha de `PASSWORD_PREVIEW` (preview) ou `PASSWORD_HML` (hml). **Importante:** as variáveis precisam ser exportadas para o processo k6; por isso use `set -a`/`set +a` ou `export` no arquivo.
   * **Direto:** `K6_USERNAME` e `K6_PASSWORD` no `.env` ou na linha de comando:
     ```bash
     k6 run -e K6_USERNAME=cpf -e K6_PASSWORD=senha tests/load.progress.test.js
     ```

3. **Opcional – ambiente** (default: `preview`):  
   `k6 run -e ENV=hml -e USER=ADMSENAI_HML tests/load.progress.test.js` (com `.env` carregado)

---

## 🗂️ Estrutura de Pastas

```
k6-tests/
├── auth/
│   └── token.js
│
├── config/
│   ├── .env.example  # Modelo de variáveis de ambiente (copie para .env)
│   ├── environments.js
│   ├── scenarios.js
│   └── testData.js   # Dados de teste centralizados (userId, filtros, paginação)
│
├── lib/
│   └── setup.js      # Setup compartilhado (createSetupData)
│
├── endpoints/
│   ├── filterClasses.js
│   ├── history.js
│   ├── importClasses.js
│   └── progress.js
│
└── tests/
    ├── load.*.test.js
    ├── spike.*.test.js
    └── stress.*.test.js
```

---

## 🔐 Autenticação (`auth`)

### `token.js`

Responsável por gerar o token de autenticação OAuth utilizado em todos os testes.

**Responsabilidades:**

* Realizar login via endpoint OAuth
* Validar sucesso da autenticação
* Retornar o token no formato esperado (`Bearer <token>`)

---

## ⚙️ Configurações (`config`)

### `environments.js`

Define os ambientes disponíveis para execução dos testes.

* `preview`
* `hml`

Cada ambiente possui:

* `baseUrl`
* `authUrl`

---

### Variáveis de ambiente (`.env`)

Credenciais e ambiente são configurados por variáveis de ambiente. Use `config/.env.example` como modelo: copie para `config/.env` (ou use `config/users.env`), preencha e carregue no shell **exportando** as variáveis antes de rodar o k6 — use `set -a && source config/users.env && set +a` ou defina cada variável com `export` no arquivo. O arquivo `.env` não é versionado.

**Credenciais – duas formas:**

1. **Por key:** Defina no `.env` as keys de usuário (ex.: `ADM_SENAI`, `ADM_DR`, `ADM_ESCOLA`) com o CPF e as senhas por ambiente (`PASSWORD_PREVIEW`, `PASSWORD_HML`). Na execução, passe `USER=nome_da_key`; o setup usa o valor da key como username e a senha conforme `ENV` (preview → `PASSWORD_PREVIEW`, hml → `PASSWORD_HML`).
2. **Direto:** Defina `K6_USERNAME` e `K6_PASSWORD` no `.env` ou com `-e` na linha de comando.

---

### `scenarios.js`

Define os cenários de execução do k6:

* **load** – carga constante
* **spike** – picos abruptos de usuários
* **stress** – aumento gradual até exaustão

Esses cenários são reutilizados por todos os testes.

---

## 🔗 Endpoints (`endpoints`)

Cada arquivo representa um endpoint ou fluxo específico do sistema.

### `filterClasses.js`

Aplica o filtro inicial de turmas disponíveis para importação.

* Método: `POST`
* Finalidade: Pré-condição para listagem e importação

---

### `history.js`

Consulta o histórico de importações realizadas.

* Método: `GET`
* Finalidade: Validação de registros processados

---

### `progress.js`

Consulta o modal de progresso das importações em andamento.

* Método: `GET`
* Finalidade: Monitoramento do processamento

---

### `importClasses.js` ⭐

Arquivo central do fluxo de importação de turmas.

**Fluxo executado:**

1. Aplicação do filtro de turmas
2. Listagem das turmas filtradas
3. Decisão de negócio:

   * Se não houver turmas → importação é pulada
   * Se houver turmas → endpoint de importação é acionado

**Métricas customizadas:**

* `import_classes_requests_total`
* `import_classes_skipped_no_data_total`

**Checks visíveis no relatório:**

* LISTAGEM – turmas retornadas com sucesso
* IMPORTAÇÃO – endpoint executado
* IMPORTAÇÃO – nenhuma turma disponível para importar

Este design garante que o teste:

* Nunca falhe por ausência de dados
* Sempre exercite o fluxo completo
* Seja estável em ambientes compartilhados

---

## 🧪 Testes (`tests`)

Os arquivos de teste são responsáveis apenas por **orquestrar a execução**, sem conter lógica de negócio.

Cada endpoint possui testes em três variações:

* `load.*.test.js`
* `spike.*.test.js`
* `stress.*.test.js`

### Estrutura padrão de um teste

* Definição do cenário (`options`)
* Geração do token no `setup()`
* Execução do endpoint no `default function`

---

## ▶️ Exemplos de execução

```bash
# Por key (exporte as variáveis: set -a + source, ou use export no .env):
set -a && source config/users.env && set +a && k6 run -e USER=ADM_SENAI tests/load.progress.test.js
set -a && source config/users.env && set +a && k6 run -e ENV=hml -e USER=ADMSENAI_HML tests/load.progress.test.js

# Com .env carregado (K6_USERNAME/K6_PASSWORD já definidos):
k6 run tests/load.importClasses.test.js
k6 run tests/spike.progress.test.js
k6 run -e ENV=hml tests/load.progress.test.js

# Credenciais direto na linha de comando:
k6 run -e K6_USERNAME=cpf -e K6_PASSWORD=senha tests/load.progress.test.js
```

---

## 📈 Interpretação dos Resultados

* **Checks** indicam validações funcionais
* **HTTP metrics** indicam performance técnica
* **Custom metrics** indicam comportamento de negócio

Exemplo de leitura correta:

* Importação pode ser pulada sem erro
* Fluxo é considerado válido mesmo sem dados
* Performance é medida até o ponto de decisão

---

## 🎯 Objetivo do Projeto

Este projeto foi estruturado para:

* Validar performance real de fluxos dependentes
* Evitar falsos negativos em ambientes voláteis
* Produzir relatórios claros para QA, DEV e gestão
* Servir como base reutilizável para novos endpoints

---

📎 **Projeto mantido com foco em qualidade, clareza e confiabilidade dos testes de performance.**
