import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import { stmts } from '../db.js';

const router = express.Router();

const YAID_API_BASE_URL = process.env.YAID_API_BASE_URL || 'https://api.yaid.com.br';
const YAID_API_KEY = process.env.YAID_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * POST /api/checkout
 * RF-BACK-02: Cria um Proof Request na YaID e retorna a verificationUrl.
 */
router.post('/', async (req, res) => {
  try {
    if (!YAID_API_KEY) {
      return res.status(500).json({
        error: 'YAID_API_KEY não configurada. Verifique o arquivo .env do backend.',
      });
    }

    // 1. Gera ID de pedido interno
    const orderId = uuidv4();
    const externalReference = `order_${orderId}`;

    // 2. Persiste o pedido como 'pending'
    stmts.createOrder.run({ id: orderId, externalReference });

    // 3. Chama a API da YaID — POST /api/proof-requests
    const yaidResponse = await fetch(`${YAID_API_BASE_URL}/api/proof-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': YAID_API_KEY,
      },
      body: JSON.stringify({
        proofType: 'age_over_18',
        externalReference,
        environment: 'homol',
        redirectUrl: `${FRONTEND_URL}/success?orderId=${orderId}`,
        cancelUrl: `${FRONTEND_URL}/failure?orderId=${orderId}`,
      }),
    });

    if (!yaidResponse.ok) {
      const errorBody = await yaidResponse.text();
      console.error('[Checkout] Erro na YaID API:', yaidResponse.status, errorBody);
      return res.status(502).json({
        error: 'Falha ao criar proof request na YaID.',
        details: errorBody,
      });
    }

    const yaidData = await yaidResponse.json();

    // Extrai verificationUrl da resposta (estrutura: session.verificationUrl ou verificationUrl)
    const verificationUrl =
      yaidData?.session?.verificationUrl || yaidData?.verificationUrl;
    const proofRequestId = yaidData?.id || yaidData?.proofRequestId;

    if (!verificationUrl) {
      console.error('[Checkout] verificationUrl não encontrada na resposta:', yaidData);
      return res.status(502).json({
        error: 'verificationUrl não retornada pela YaID.',
        raw: yaidData,
      });
    }

    // 4. Atualiza o pedido com dados da YaID
    stmts.updateProofRequest.run({
      id: orderId,
      proofRequestId: proofRequestId || null,
      verificationUrl,
    });

    console.log(`[Checkout] Pedido criado: ${orderId} → ${verificationUrl}`);

    // 5. Retorna ao frontend
    return res.status(200).json({
      orderId,
      verificationUrl,
    });
  } catch (err) {
    console.error('[Checkout] Erro inesperado:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

export default router;
