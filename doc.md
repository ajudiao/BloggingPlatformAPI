# Blog API - Documentacao ate aqui

Este documento explica como o projeto esta organizado e o que cada funcao implementada faz neste momento.

## 1. Objetivo do projeto

A aplicacao e uma API REST para gerir posts de um blog.

Neste momento existem cinco operacoes funcionais:

- `POST /posts`: cria um post.
- `GET /posts`: lista os posts, com ordenacao configuravel.
- `GET /posts/:id`: procura um post pelo ID.
- `PUT /posts/:id`: atualiza um post.
- `DELETE /posts/:id`: apaga um post.


## 2. Tecnologias principais

- Node.js: executa o JavaScript no servidor.
- TypeScript: adiciona tipagem ao codigo.
- Express: cria o servidor HTTP e organiza as rotas.
- Zod: valida dados recebidos pela API.
- Prisma: comunica com a base de dados.
- PostgreSQL: guarda os posts.
- `@prisma/adapter-pg`: adapter que liga o Prisma ao PostgreSQL.

## 3. Arquitetura do projeto

O projeto usa uma separacao por camadas:

```text
Cliente HTTP
    |
    v
Rotas
    |
    v
Controller -> Validator
    |
    v
Service
    |
    v
Repository
    |
    v
Prisma -> PostgreSQL
```

### Responsabilidade de cada camada

#### Routes

Define qual metodo HTTP e qual URL chamam cada funcao do controller.

#### Controller

Trata HTTP. Le o `request`, valida os dados de entrada, chama o service e constroi o `response`.

Nao deve conter consultas diretas ao Prisma nem regras complexas de negocio.

#### Validator

Verifica se os dados tem o formato esperado. Por exemplo, confirma se `title` e uma string e se `tags` e um array.

#### Service

Contem as regras de negocio. Por exemplo, pode limpar o titulo, impedir titulos muito curtos ou decidir se uma operacao pode acontecer.

#### Repository

Contem o acesso a base de dados. Usa o Prisma para criar ou procurar registos.

## 4. Arranque da aplicacao

Ficheiro: `src/server.ts`

### Funcao `bootstrap`

```ts
const bootstrap = async () => { ... }
```

E a funcao responsavel por iniciar a aplicacao.

O que faz:

1. Executa `SELECT 1` atraves do Prisma.
2. Confirma que o PostgreSQL esta realmente acessivel.
3. So depois abre a porta HTTP com `app.listen`.
4. Se a base de dados falhar, escreve o erro e termina o processo com `process.exit(1)`.

O `SELECT 1` e importante porque, com o adapter PostgreSQL, apenas criar o cliente ou chamar `$connect()` pode nao forcar uma comunicacao real. A query confirma a ligacao de verdade.

### `app.listen`

Abre o servidor HTTP na porta definida por `env.PORT`. Quando termina de iniciar, escreve uma mensagem no terminal.

O servidor so anuncia que esta a correr depois da verificacao da base de dados passar.

## 5. Configuracao da aplicacao

Ficheiro: `src/app.ts`

### `express()`

Cria a aplicacao Express.

### `app.use(express.json())`

Permite que a API leia corpos JSON, por exemplo:

```json
{
  "title": "Aprender Javascript",
  "content": "Conteudo do post",
  "category": "programacao",
  "tags": ["javascript", "api"]
}
```

Sem este middleware, `req.body` nao seria preenchido para pedidos JSON.

### `app.use("/posts", postRoutes)`

Regista todas as rotas de posts com o prefixo `/posts`.

Por isso, a rota `/` definida em `post.routes.ts` torna-se `/posts` na API.

### `app.use(errorMiddleware)`

Regista o middleware global de erros. Ele deve ficar depois das rotas para receber erros lancados durante o processamento dos pedidos.

## 6. Rotas

Ficheiro: `src/routes/post.routes.ts`

### `Router()`

Cria um router Express separado para as rotas de posts.

### Funcoes importadas do controller

O controller nao e instanciado. Cada operacao e uma funcao independente exportada por `post.controller.ts`:

- `createPost`: liga `POST /posts`.
- `findAllPosts`: liga `GET /posts`.
- `findPostById`: liga `GET /posts/:id`.
- `updatePost`: liga `PUT /posts/:id`.
- `deletePost`: liga `DELETE /posts/:id`.

As funcoes sao passadas diretamente ao Express. Como nao dependem de `this`, nao precisam de `bind`.

## 7. Validacao dos posts

Ficheiro: `src/validators/post.validator.ts`

### `createPostSchema`

Define o formato necessario para criar um post:

- `title`: string com pelo menos 1 caracter.
- `content`: string com pelo menos 1 caracter.
- `category`: string com pelo menos 1 caracter.
- `tags`: array de strings.

Este schema valida formato. Ele nao verifica regras que dependem da logica da aplicacao, como titulos duplicados ou o tamanho minimo de negocio do titulo.

### `findAllPostsQuerySchema`

Valida os parametros usados para ordenar a listagem:

- `sortBy`: `createdAt`, `updatedAt` ou `title`.
- `order`: `asc` ou `desc`.

Quando nao sao enviados parametros, os valores usados sao:

```text
sortBy = createdAt
order  = desc
```

Assim, `GET /posts` mostra primeiro os posts mais recentes.

## 8. Controller

Ficheiro: `src/controllers/post.controller.ts`

O controller usa funcoes independentes. Cada funcao representa uma operacao HTTP e e exportada individualmente.

### `createPost(req, res)`

Processa `POST /posts`.

Passos:

1. Le os dados em `req.body`.
2. Usa `createPostSchema.safeParse` para validar os dados.
3. Se forem invalidos, devolve `400` com os erros.
4. Se forem validos, chama `createPost` no service.
5. Devolve `201` com o post criado.

O controller nao cria diretamente o registo na base de dados. Essa responsabilidade passa pelo service e pelo repository.

### `findAllPosts(req, res)`

Processa `GET /posts`.

Passos:

1. Le os parametros em `req.query`.
2. Valida-os com `findAllPostsQuerySchema`.
3. Se forem invalidos, devolve `400`.
4. Chama `findAllPosts` no service.
5. Devolve `200` com o array de posts.

Exemplos:

```http
GET /posts
GET /posts?sortBy=title&order=asc
GET /posts?sortBy=updatedAt&order=desc
```

### `findPostById(req, res)`

Converte o parametro `id` para numero, valida se e um inteiro positivo, chama `getPostById` no service e devolve `200` com o post encontrado.

### `updatePost(req, res)`

Processa `PUT /posts/:id`.

1. Valida o `id` como inteiro positivo.
2. Valida o corpo completo com `updatePostSchema`.
3. Chama `updatePost` no service.
4. Devolve `200` com o post atualizado.

### `deletePost(req, res)`

Valida o `id`, chama `deletePost` no service e devolve `200` com o post apagado.

## 9. Service

Ficheiro: `src/services/post.service.ts`

O service tambem usa funcoes independentes. Cada funcao contem a regra de negocio de uma operacao e chama diretamente a funcao correspondente do repository.

### `createPost(data)`

Aplica regras de negocio antes de guardar o post.

Passos:

1. Remove espacos no inicio e no fim do titulo com `trim()`.
2. Verifica se o titulo tem pelo menos 5 caracteres.
3. Se tiver menos de 5, lanca `BadRequestError`.
4. Envia os dados tratados para `createPost` no repository.
5. Se o Prisma indicar `P2002`, transforma o erro numa mensagem compreensivel:
   `Ja existe um post com este titulo`.
6. Relanca outros erros desconhecidos para o middleware global.

A verificacao de titulos duplicados tambem existe na base de dados. A regra no service melhora a mensagem, mas a garantia final e feita pelo PostgreSQL.

### `findAllPosts(options)`

Recebe os parametros de ordenacao ja validados pelo controller e envia-os para o repository.

O service nao precisa de repetir a validacao do Zod porque o controller ja validou o formato. Se no futuro esta funcao for chamada por outro local que nao seja HTTP, pode ser necessario validar tambem nesse limite.

### `updatePost(id, data)`

Limpa o titulo, exige pelo menos 5 caracteres e envia os dados para o repository. Se o titulo ja existir, transforma o erro `P2002` numa resposta de erro `400`.

## 10. Repository

Ficheiro: `src/repositories/post.repository.ts`

O repository exporta uma funcao separada para cada operacao de acesso a base de dados.

### `createPost(data)`

Executa:

```ts
prisma.post.create({ data })
```

Cria um novo post na tabela `Post` e devolve o registo criado.

### `findAllPosts({ sortBy, order })`

Executa `prisma.post.findMany` com ordenacao dinamica:

```ts
orderBy: { [sortBy]: order }
```

Os valores possiveis ja foram limitados pelo validator, por isso o cliente so consegue escolher os campos permitidos.

### `updatePost(id, data)`

Executa `prisma.post.update({ where: { id }, data })`. Se o ID nao existir, transforma o erro `P2025` em `NotFoundError`, que resulta em `404`.

## 11. Cliente Prisma e PostgreSQL

Ficheiro: `src/lib/prisma.ts`

### `PrismaPg`

Cria o adapter PostgreSQL usando `env.DATABASE_URL`.

### `new PrismaClient({ adapter })`

Cria o cliente Prisma usado pelo repository.

O cliente e exportado uma vez e reutilizado pela aplicacao.

## 12. Modelo da base de dados

Ficheiro: `prisma/schema.prisma`

O modelo `Post` possui:

- `id`: identificador inteiro automatico.
- `title`: titulo obrigatorio e unico.
- `content`: conteudo obrigatorio.
- `category`: categoria obrigatoria.
- `tags`: array de strings.
- `createdAt`: preenchido automaticamente na criacao.
- `updatedAt`: atualizado automaticamente quando o post muda.

### Titulos duplicados

A regra abaixo impede titulos exatamente iguais:

```prisma
title String @unique
```

Esta regra e garantida pelo PostgreSQL atraves de um indice unico. Mesmo que duas requisicoes cheguem quase ao mesmo tempo, a base nao permite gravar o mesmo titulo duas vezes.

Neste momento, `Javascript` e `javascript` ainda sao considerados diferentes, porque o PostgreSQL compara as letras maiusculas e minusculas de forma diferente neste campo.

## 13. Erros

Ficheiro: `src/utils/errors.ts`

### `BadRequestError`

Representa um erro causado por dados ou regras invalidas do pedido. Tem `statusCode = 400`.

E usado quando o titulo tem menos de 5 caracteres ou ja existe outro post com o mesmo titulo.

### `NotFoundError`

Representa um recurso inexistente e tem `statusCode = 404`.

E usado quando o ID procurado ou atualizado nao corresponde a nenhum post.

Ficheiro: `src/middlewares/error.middleware.ts`

### `errorMiddleware(error, req, res, next)`

Recebe erros que nao foram tratados diretamente pelo controller.

- Se o erro tiver um `statusCode` numerico, usa esse status.
- Caso contrario, devolve `500`.
- Para erros `500`, esconde os detalhes e devolve `Internal server error`.
- Para erros conhecidos, devolve a mensagem do erro.
- Escreve o erro completo no terminal para facilitar o debug.

## 14. Fluxo completo: criar um post

```text
POST /posts
    |
    v
post.routes.ts chama createPost do controller
    |
    v
createPostSchema valida req.body
    |
    v
createPost do service recebe result.data
    |
    v
Service limpa o titulo e verifica regras
    |
    v
createPost do repository recebe data
    |
    v
prisma.post.create
    |
    v
PostgreSQL valida title @unique e grava o post
    |
    v
Controller devolve HTTP 201
```

## 15. Fluxo completo: listar posts

```text
GET /posts?sortBy=title&order=asc
    |
    v
post.routes.ts chama findAllPosts do controller
    |
    v
findAllPostsQuerySchema valida a query
    |
    v
findAllPosts do service recebe options
    |
    v
findAllPosts do repository recebe options
    |
    v
prisma.post.findMany({ orderBy: { title: "asc" } })
    |
    v
Controller devolve HTTP 200 com os posts
```

## 16. Fluxo completo: atualizar um post

```text
PUT /posts/:id
    |
    v
post.routes.ts chama updatePost do controller
    |
    v
updatePostSchema valida req.body
    |
    v
updatePost do service valida e limpa o titulo
    |
    v
updatePost do repository atualiza o registo
    |
    v
prisma.post.update
    |
    v
Controller devolve HTTP 200 com o post atualizado
```

## 17. Como executar

Instalar dependencias:

```bash
npm install
```

Gerar o cliente Prisma:

```bash
npm run prisma:generate
```

Aplicar migrations em desenvolvimento:

```bash
npx prisma migrate dev
```

Iniciar em desenvolvimento:

```bash
npm run dev
```

Compilar:

```bash
npm run build
```

Iniciar a versao compilada:

```bash
npm start
```

## 18. Testes manuais atuais

Criar um post:

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Aprender Javascript","content":"Conteudo do post","category":"programacao","tags":["javascript"]}'
```

Listar por data, mais recentes primeiro:

```bash
curl "http://localhost:3000/posts"
```

Listar por titulo, de A a Z:

```bash
curl "http://localhost:3000/posts?sortBy=title&order=asc"
```

Tentar criar um titulo duplicado deve devolver `400` com uma mensagem informando que o titulo ja existe.

Atualizar um post existente:

```bash
curl -X PUT http://localhost:3000/posts/1 \
    -H "Content-Type: application/json" \
    -d '{"title":"Aprender TypeScript","content":"Conteudo atualizado","category":"programacao","tags":["typescript","api"]}'
```

O corpo do `PUT` deve conter `title`, `content`, `category` e `tags`. Um ID inexistente devolve `404`; um ID invalido ou dados invalidos devolvem `400`.

## 19. Proximos passos naturais

1. Criar testes para `POST /posts` e `GET /posts`.
2. Adicionar testes para `GET /posts/:id`, `PUT /posts/:id` e `DELETE /posts/:id`.
3. Adicionar paginacao ao `findAll` quando a quantidade de posts crescer.
4. Decidir se `Javascript` e `javascript` devem ser tratados como o mesmo titulo.
