# Blog API

API REST para criar, consultar, atualizar e remover posts de um blog. O projeto usa Express com TypeScript, PostgreSQL e Prisma ORM.

## Referencia do desafio

Este projeto foi desenvolvido com base no desafio [Blogging Platform API](https://roadmap.sh/projects/blogging-platform-api) do roadmap.sh.

## Tecnologias

- Node.js
- TypeScript
- Express 5
- Prisma ORM 7
- PostgreSQL
- Zod para validacao dos dados

## Requisitos

- Node.js 20 ou superior
- npm
- Uma instancia PostgreSQL acessivel pela aplicacao

## Instalacao

Clone o repositorio e instale as dependencias:

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/blog_db?schema=public"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

`DATABASE_URL` e obrigatoria. `PORT`, `NODE_ENV` e `CORS_ORIGIN` possuem valores padrao, mas podem ser alteradas conforme o ambiente.

## Banco de dados

Aplique as migrations existentes e gere o Prisma Client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

Para visualizar os dados em uma interface web:

```bash
npm run prisma:studio
```

O modelo `Post` possui os campos `id`, `title`, `content`, `category`, `tags`, `createdAt` e `updatedAt`. O titulo deve ser unico.

## Executando a API

Modo de desenvolvimento, com reinicio automatico:

```bash
npm run dev
```

Build e execucao em producao:

```bash
npm run build
npm start
```

Por padrao, a API fica disponivel em `http://localhost:3000`. O servidor testa a conexao com o PostgreSQL antes de aceitar requisicoes.

## Endpoints

### Criar um post

`POST /posts`

Campos obrigatorios: `title`, `content`, `category` e `tags`. `tags` deve ser um array de strings.

```bash
curl -X POST http://localhost:3000/posts \
	-H "Content-Type: application/json" \
	-d '{
		"title": "Aprendendo TypeScript",
		"content": "Conteudo do post.",
		"category": "programacao",
		"tags": ["typescript", "node"]
	}'
```

O titulo deve ter pelo menos 5 caracteres e nao pode repetir um titulo ja cadastrado.

### Listar posts

`GET /posts`

Por padrao, os posts sao ordenados por `createdAt` em ordem decrescente.

```bash
curl "http://localhost:3000/posts"
curl "http://localhost:3000/posts?sortBy=title&order=asc"
curl "http://localhost:3000/posts?term=typescript"
```

Valores aceitos:

- `sortBy`: `createdAt`, `updatedAt` ou `title`
- `order`: `asc` ou `desc`
- `term`: pesquisa por título, conteúdo ou categoria

### Consultar um post

`GET /posts/:id`

```bash
curl http://localhost:3000/posts/1
```

### Atualizar um post

`PUT /posts/:id`

O corpo deve conter todos os campos do post, pois a atualizacao usa o schema completo de criacao.

```bash
curl -X PUT http://localhost:3000/posts/1 \
	-H "Content-Type: application/json" \
	-d '{
		"title": "TypeScript no backend",
		"content": "Conteudo atualizado.",
		"category": "backend",
		"tags": ["typescript", "api"]
	}'
```

### Remover um post

`DELETE /posts/:id`

```bash
curl -X DELETE http://localhost:3000/posts/1
```

### Health check

`GET /`

Retorna `Server running` quando a aplicacao esta no ar.

## Respostas e erros

- `201`: post criado.
- `200`: operacao concluida.
- `400`: dados, parametros ou ID invalidos.
- `404`: post nao encontrado.
- `500`: erro interno do servidor.

Erros retornam JSON com a propriedade `message`. Erros de validacao tambem incluem `errors` com os campos invalidos.

## Estrutura

```text
src/
	config/          Configuracoes de ambiente, CORS e banco
	controllers/     Camada HTTP
	middlewares/     Middlewares globais
	repositories/    Acesso aos dados via Prisma
	routes/          Rotas da API
	services/        Regras de negocio
	validators/      Schemas de validacao com Zod
prisma/
	schema.prisma    Modelo do banco
	migrations/      Historico de migrations
client/            Paginas HTML de exemplo
```

