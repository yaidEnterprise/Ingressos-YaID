import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Rotas
import checkoutRouter from './routes/checkout.js';
import webhookRouter from './routes/webhook.js';
import statusRouter from './routes/status.js';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─────────────────────────────────────────────────────────────
// Middlewares globais
// ─────────────────────────────────────────────────────────────

// CORS — permite apenas o frontend configurado
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// RNF-01: Preservação do rawBody para validação Ed25519 do webhook
// O `verify` callback captura os bytes brutos ANTES do parse JSON
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// Rotas
// ─────────────────────────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      yaidApiKey: process.env.YAID_API_KEY ? '✅ configurada' : '❌ ausente',
      yaidPublicKey: process.env.YAID_PUBLIC_KEY ? '✅ configurada' : '❌ ausente',
    },
  });
});

// API pública (chamada pelo frontend)
app.use('/api/checkout', checkoutRouter);
app.use('/api/order', statusRouter);

// Webhook (chamado pela YaID — deve ser público via Ngrok)
app.use('/webhooks/yaid', webhookRouter);

// ─────────────────────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// ─────────────────────────────────────────────────────────────
// Inicialização
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🎟️  YaID Ingressos — Backend         ║');
  console.log(`║   Rodando em: http://localhost:${PORT}    ║`);
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  YAID_API_KEY : ${process.env.YAID_API_KEY ? '✅ OK' : '❌ AUSENTE — configure .env'}`);
  console.log(`║  YAID_PUB_KEY : ${process.env.YAID_PUBLIC_KEY ? '✅ OK' : '❌ AUSENTE — configure .env'}`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('  Endpoints disponíveis:');
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  POST http://localhost:${PORT}/api/checkout`);
  console.log(`  GET  http://localhost:${PORT}/api/order/:id`);
  console.log(`  POST http://localhost:${PORT}/webhooks/yaid`);
  console.log('');
  console.log('  💡 Dica: Exponha o backend via Ngrok para receber webhooks:');
  console.log('     ngrok http 3001');
  console.log('');
});
