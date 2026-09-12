# YaID Ingressos VIP — Plataforma TCC

Site de venda de ingressos com verificação de identidade via **YaID API**.

## 🗂️ Estrutura do Projeto

```
site teste/
├── backend/          # Node.js + Express
│   ├── routes/
│   │   ├── checkout.js   # POST /api/checkout
│   │   ├── webhook.js    # POST /webhooks/yaid
│   │   └── status.js     # GET /api/order/:id
│   ├── db.js             # SQLite (better-sqlite3)
│   ├── server.js         # Ponto de entrada
│   ├── .env.example      # Template das variáveis de ambiente
│   └── package.json
│
└── frontend/         # React + Vite
    └── src/
        ├── pages/
        │   ├── Home.jsx      # Vitrine do evento
        │   ├── Success.jsx   # Aguardando/sucesso (com polling)
        │   └── Failure.jsx   # Verificação recusada
        ├── App.jsx           # React Router
        ├── index.css         # Design system completo
        └── main.jsx
```

## 🚀 Como rodar

### 1. Configurar o Backend

```bash
cd backend
cp .env.example .env
# Edite o .env com suas credenciais YaID
npm run dev
```

### 2. Rodar o Frontend

```bash
cd frontend
npm run dev
```

Acesse: **http://localhost:5173**

### 3. Expor o Backend via Ngrok (para webhooks)

```bash
ngrok http 3001
# Copie a URL gerada e configure no painel da YaID como webhook URL:
# https://SEU-ID.ngrok.io/webhooks/yaid
```

## 🔐 Variáveis de Ambiente (.env)

| Variável | Descrição |
|---|---|
| `YAID_API_KEY` | Chave de API da YaID (header `x-api-key`) |
| `YAID_PUBLIC_KEY` | Chave pública Ed25519 para validar webhooks |
| `FRONTEND_URL` | URL do frontend (para CORS e redirects) |
| `PORT` | Porta do servidor backend (padrão: 3001) |

## 🔗 Endpoints do Backend

| Método | Rota | Descrição |
|---|---|---|
| `GET`  | `/health` | Status do servidor e credenciais |
| `POST` | `/api/checkout` | Cria Proof Request na YaID |
| `GET`  | `/api/order/:id` | Consulta status de um pedido |
| `POST` | `/webhooks/yaid` | Recebe eventos da YaID (webhook) |

## 📋 Fluxo Completo

1. Usuário clica em **"Garantir Ingresso VIP"**
2. Frontend chama `POST /api/checkout`
3. Backend cria Proof Request na YaID e retorna `verificationUrl`
4. Frontend redireciona para a URL da YaID
5. Usuário completa verificação no portal YaID
6. YaID envia webhook para `POST /webhooks/yaid`
7. Backend valida assinatura Ed25519 e atualiza status do pedido
8. Frontend (polling a cada 3s) detecta status `approved` e exibe sucesso
