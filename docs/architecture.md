# Arquitetura — FeiraFlow

## Visão geral

FeiraFlow é uma API BFF (Backend For Frontend) construída em Node.js (Express) que centraliza regras de negócio, integra dados do banco do projeto (MongoDB Atlas) e consome APIs externas (geocodificação e clima) para devolver respostas enriquecidas ao frontend ou clientes (Postman/Insomnia).

Objetivos arquiteturais:

* manter separação de responsabilidades (routes → controllers → services → models);
* ser simples de desenvolver e testar (mocks para serviços externos);
* possibilitar evolução: check-ins, notificações, autenticação e escalabilidade.

---

## Componentes principais

* **Cliente**: Frontend (React/Vue) ou ferramentas de teste (Postman/Insomnia) que consomem a API.
* **API FeiraFlow (Express)** — aplicação Node.js organizada em camadas:

  * `src/routes/` → roteamento e composição de endpoints;
  * `src/controllers/` → handlers que orquestram operações;
  * `src/services/` → integrações com APIs externas (Nominatim, OpenWeather) + utilitários (cache);
  * `src/models/` → schemas Mongoose que representam coleções no MongoDB Atlas;
  * `config/` → conexão com MongoDB (`mongoDb.js`).
* **MongoDB Atlas** — armazena coleções: `feiras`, `feirantes`, `produtos`, `feira_feirante`, `feirante_produto`, `avaliacoes_feirantes`.
* **APIs externas**:

  * **Nominatim (OpenStreetMap)** — geocodificação (`endereco` → `lat/lon`), usada no cadastro de feiras quando coordenadas não são informadas.
  * **OpenWeather** — dados de clima por coordenadas, usado no endpoint `feiraOverview`.

---

## Diagrama lógico (resumido)

```
 [Client: Frontend / Postman]
           |
           v
   +------------------------------+
   |  FeiraFlow API (Express.js)  |
   |  - routes/controllers        |
   |  - services (nominatim,ow)   |
   |  - models (Mongoose)         |
   +------------------------------+
     |                    |
     |                    |
     v                    v
 [MongoDB Atlas]      [External APIs]
  (feiras, etc.)       - Nominatim
                       - OpenWeather
```

---

## Fluxo de uma requisição (ex.: GET /buscar_feiras/:id/overview)

1. Cliente faz `GET /buscar_feiras/:id/overview`.
2. Express roteia para `RelatoriosControllers.feiraOverview`.
3. Controller busca a feira no MongoDB (`Feira.findById(id)`).
4. Se a feira tem `latitude/longitude`, chama `weatherService.getWeather(lat,lon)`; caso contrário, não consulta o serviço de clima.
5. `weatherService` realiza requisição HTTP ao OpenWeather, aplica cache (NodeCache) e retorna dados resumidos.
6. Controller compõe `overview` (feira + weather) e retorna JSON ao cliente.

---

## Integração com APIs externas (detalhes)

* **Nominatim**

  * Endpoint: `GET /search?q=<endereco>&format=json&limit=1`
  * Uso: `nominatimService.geocodeAddress(endereco)` — chamado em `CadastrosControllers.cadastrarFeira` quando coordenadas ausentes.
  * Observação: respeitar politica de uso. Cache em 1h reduz chamadas.

* **OpenWeather**

  * Endpoint: `GET /data/2.5/weather?lat={lat}&lon={lon}&appid={KEY}`
  * Uso: `weatherService.getWeather(lat, lon)` em `RelatoriosControllers.feiraOverview`.
  * Observação: chave obrigatória (`OPENWEATHER_KEY`), cache 10 minutos para evitar chamadas repetidas.

---

## Padrões e decisões técnicas

* **Arquitetura em camadas**: facilita testes unitários (controllers testáveis isoladamente) e manutenção.
* **BFF (Backend for Frontend)**: a API agrega dados de múltiplas fontes (DB + serviços externos) antes de entregar ao cliente.
* **Mongoose + MongoDB Atlas**: escolha por flexibilidade do modelo documental e facilidade para prototipagem.
* **Cache local**: NodeCache para reduzir chamadas externas em ambientes acadêmicos.
* **Tratamento de erros**: controllers tratam erros e retornam códigos HTTP (400/404/500); falhas em serviços externos não bloqueiam resposta — retornam `null`/fallback.

---

## Segurança e configurações

* **Variáveis sensíveis** em `.env`: `MONGO_URI`, `OPENWEATHER_KEY`, `NOMINATIM_URL`.
* **Validação de entrada**: Controllers devem validar campos obrigatórios (ex: `descricao`, `endereco` em cadastrarFeira).

---

## Mapas de rotas ↔ arquitetura

* `POST /cadastrar_feira` → Controller `CadastrosControllers.cadastrarFeira` → `nominatimService` (opcional) → `Feira` model → MongoDB
* `POST /cadastrar_feirante` → Controller `CadastrosControllers.cadastrarFeirante` → `Feirante` model → MongoDB
* `GET /buscar_produtos?produto=...` → Controller `RelatoriosControllers.buscaProdutos` → `Produto`, `Feirante_Produto`, `Feira_Feirante`, `Feira` models → MongoDB
* `GET /buscar_feiras/:id/overview` → Controller `RelatoriosControllers.feiraOverview` → `Feira` model → `weatherService` (OpenWeather) → responde com dados agregados

---

## Como essa arquitetura atende ao ODS 11

* Facilita o acesso a informações sobre feiras locais e produtos, promovendo inclusão econômica e melhoria no uso do espaço urbano.
* Dados coletados podem ser usados por gestores municipais para planejamento (ex.: frequência de feiras, produtos mais ofertados).

---

## Arquivos relevantes no repositório

* `src/app.js`, `server.js` — bootstrap e config.
* `src/routes/*` — rotas.
* `src/controllers/*` — lógica das requisições.
* `src/services/*` — integrações externas e cache.
* `src/models/*` — Mongoose schemas.
* `config/mongoDb.js` — conexão.
* `tests/*` — testes unitários (mocks).

---