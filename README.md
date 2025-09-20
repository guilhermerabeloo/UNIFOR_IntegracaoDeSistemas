# FeiraFlow — README

## Objetivo do trabalho

O objetivo deste projeto é implementar uma API (BFF) para o aplicativo **FeiraFlow**, que conecta feirantes e consumidores, permitindo cadastrar feiras e feirantes, relacionar produtos, e pesquisar onde um produto está disponível. A API também demonstra integrações com APIs externas (geocodificação e clima) para enriquecer respostas, conforme requisito da disciplina de Integração de Sistemas.

## Descrição funcional da solução

Principais atores:

* **Gestora da plataforma**: cadastra feiras e autoriza feirantes.
* **Feirante**: perfil, cadastro de produtos, associação a feiras, check-in (implementação futura).
* **Consumidor**: pesquisa produtos, visualiza feirantes e feiras onde o produto está disponível.

Funcionalidades implementadas nesta versão:

* Cadastro de feiras (`POST /cadastrar_feira`) — tenta autocompletar coordenadas via Nominatim se latitude/longitude ausentes.
* Cadastro de feirantes (`POST /cadastrar_feirante`).
* Busca de feiras (`GET /buscar_feiras`).
* Busca de produtos com retorno de feirantes e feiras vinculadas (`GET /buscar_produtos?produto=termo`).
* Endpoint de overview da feira com consulta ao OpenWeather para retornar clima com base em coordenadas (`GET /buscar_feiras/:id/overview`).

Observações:

* Modelagem em MongoDB (Atlas) com coleções: `feiras`, `feirantes`, `produtos`, `feira_feirante`, `feirante_produto`, `avaliacoes_feirantes` (se houver).
* Integrações externas usadas: **Nominatim (OpenStreetMap)** para geocodificação; **OpenWeather** para clima.

## Arquitetura da API

Arquitetura em camadas (API-only / BFF):

* **Cliente** (Postman / Frontend) → **API FeiraFlow (Express + controllers)** → **MongoDB Atlas**
* API FeiraFlow também consome: **Nominatim** (geocode) e **OpenWeather** (clima).

Diagrama (simplificado):

```
[Client: Frontend/Postman]
          |
          v
    [FeiraFlow API - Express]
    /         |            \
   v          v             v
[MongoDB]  [Nominatim]  [OpenWeather]
```

Componentes principais do repo:

* `src/app.js` - configura Express, rotas e conexão com MongoDB.
* `src/routes/*` - definição de rotas (CadastrosRoutes, RelatoriosRoutes).
* `src/controllers/*` - controle das requisições e regras de negócio (CadastrosControllers, RelatoriosControllers).
* `src/models/*` - schemas Mongoose por coleção.
* `src/services/*` - integrações externas (`nominatimService.js`, `weatherService.js`).
* `config/mongoDb.js` - conexão com MongoDB Atlas.

## Diagrama de dados (resumo)

* `feiras` ({ \_id, descricao, endereco, latitude, longitude, dias\_funcionamento, horarios\_funcionamento })
* `feirantes` ({ \_id, descricao, slogan, telefone, email, ativo })
* `produtos` ({ \_id, descricao, tag })
* `feira_feirante` ({ \_id, feira\_id, feirante\_id, dias\_presenca?, checkins? })
* `feirante_produto` ({ \_id, feirante\_id, produto\_id, ativo })

## Instruções detalhadas para execução (local)

### Requisitos

* Node.js (>=16 recomendado)
* npm
* Conta no MongoDB Atlas com cluster e banco `feiraflow` (ou ajuste `MONGO_URI`)
* Chave de API do OpenWeather (opcional, mas necessária para `feiraOverview` retornar clima)

### Variáveis de ambiente (`.env` na raiz)

```
MONGO_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/feiraflow?retryWrites=true&w=majority"
NOMINATIM_URL=https://nominatim.openstreetmap.org
OPENWEATHER_KEY=<sua_chave_openweather>
```

Salve o arquivo `.env` no diretório raiz (mesmo nível do `package.json`).

### Instalação

```bash
npm install
```

### Rodar em desenvolvimento

```bash
npm run dev
# ou
npm start
```

Se usar `nodemon`, verifique o script `dev` em `package.json`.

### Testes automatizados

O projeto usa Jest para testes unitários (mocks). Configure no `package.json`:

```json
"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand"
```

Executar testes:

```bash
npm test
```

## Instruções para execução via Postman / Insomnia

1. Abra Postman ou Insomnia.
2. Crie uma nova coleção/importe `postman_collection.json` .
3. Configure variáveis de coleção ou ambiente:

   * `base_url` = `http://localhost:3000` (ou URL onde a API estiver rodando)
4. Exemplos de requisições:

   * **Cadastrar feira**

     * Método: `POST` `{{base_url}}/cadastrar_feira`
     * Body (JSON):

       ```json
       {
         "descricao": "Feira do Bairro",
         "endereco": "Av. Exemplo, Fortaleza"
       }
       ```
     * Resposta: objeto da feira criada (com `_id`, `latitude`, `longitude` se resolvidas).

   * **Cadastrar feirante**

     * Método: `POST` `{{base_url}}/cadastrar_feirante`
     * Body (JSON): `{ "descricao": "Seu João" }`

   * **Buscar feiras**

     * Método: `GET` `{{base_url}}/buscar_feiras`

   * **Buscar produtos**

     * Método: `GET` `{{base_url}}/buscar_produtos?produto=Pastel`
     * Retorna: array de objetos `{ feirante, produtos, feiras }`.

   * **Overview da feira (clima)**

     * Método: `GET` `{{base_url}}/buscar_feiras/{id}/overview`
     * Retorna: `{ feira, weather, note }` (weather = null se coords ausentes ou se OpenWeather não configurado).

## Documentação das rotas da API

Resumo dos endpoints atualmente implementados:

* `GET /` — página inicial (status)
* `GET /ping` — healthcheck

**Cadastros**

* `POST /cadastrar_feira` — corpo JSON com `descricao`, `endereco`, opcional `latitude`, `longitude`, `dias_funcionamento`, `horarios_funcionamento`.
* `POST /cadastrar_feirante` — corpo JSON com `descricao`, `slogan`, `telefone`, `email`, `ativo`.

**Relatórios / Consultas**

* `GET /buscar_feiras` — lista todas as feiras.
* `GET /buscar_feiras/:id/overview` — busca feira por id e retorna dados de clima (integração OpenWeather) se coordenadas válidas.
* `GET /buscar_produtos?produto=termo` — busca produtos por descrição ou tag e retorna feirantes e feiras vinculadas.

## Como a API integra sistemas externos (requisito da disciplina)

A API age como BFF (Backend For Frontend) e consome duas APIs externas:

1. **Nominatim (OpenStreetMap)** — para geocodificação (resolver `endereco` → `latitude`/`longitude`) no cadastro de feiras.
2. **OpenWeather** — para obter clima por coordenadas em `feiraOverview`.

Ambas as integrações são chamadas a partir dos serviços em `src/services/` e são mockadas nos testes unitários.

## Tratamento de erros e logs

* Os controllers retornam códigos HTTP apropriados: `400` (bad request), `404` (not found) e `500` (erro interno). Mensagens curtas são retornadas em JSON.
* Chamadas a serviços externos são encapsuladas em `try/catch` e, em caso de falha, retornam `null` para que a API continue respondendo com dados disponíveis do banco.

---

## Papéis e responsabilidades

**Marcos Guilherme Rabelo, 2415512**  
- Definição da arquitetura  
- Criação do banco e da modelagem no MongoDB  
- Configuração do `app.js` e `server.js`, além do `routes/index.js`  
- Testes

**Antônia Tamires Melo de Sousa, 2314703**  
- Documentação para envio

**Carlos Roberto Pereira da Silva Filho, 2326155**  
- README e `architecture.md`

**Ricardo Montesuma Filho, 2327749**  
- Funcionalidades de cadastro

**Fernando Ivo Negreiro da Silva, 2317776**  
- Funcionalidades de relatório

**Todos**  
- Brainstorm para definição do tema e dos prazos para cada um entregar sua parte
