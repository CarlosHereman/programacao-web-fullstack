# Projeto JokeHub - Programação Web Fullstack

Este projeto é um buscador de piadas com um backend em Node.js (Express) e um frontend em React (Vite).

## Integrantes

*   Abner do Nascimento Santos
*   Carlos Eduardo Pires de Santana Hereman

## Tecnologias Principais

*   **Backend**: Node.js, Express, SQLite (`better-sqlite3`)
*   **Frontend**: React, Vite, Axios, React Hook Form

## Configuração do Ambiente

### Solução para Incompatibilidade do Node.js (`better-sqlite3`)

Se você encontrar um erro de `NODE_MODULE_VERSION` relacionado ao `better-sqlite3`, execute um dos comandos abaixo na pasta `backend`:

1.  **Recompilar o módulo:**
    ```bash
    npm rebuild better-sqlite3
    ```

2.  **Reinstalação limpa (se o anterior falhar):**
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```

## Como Rodar o Projeto

### 1. Backend

Navegue até a pasta `backend` e instale as dependências:

```bash
cd backend
npm install
```

Inicie o servidor:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`.

### 2. Frontend

Abra um **novo terminal**, navegue até a pasta `frontend` e instale as dependências:

```bash
cd frontend
npm install
```

Inicie a aplicação React:

```bash
npm run dev
```

A aplicação frontend estará disponível em `http://localhost:5173`.

## Credenciais de Teste

Para testar a aplicação, utilize os seguintes usuários:

| Usuário  | Senha     |
| :------- | :-------- |
| `abner`  | `senha123`|
| `carlos` | `senha123`|
| `admin`  | `admin123`|
