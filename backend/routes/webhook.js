import express from 'express';
import * as ed from '@noble/ed25519';
import { stmts } from '../db.js';

const router = express.Router();

const YAID_PUBLIC_KEY = process.env.YAID_PUBLIC_KEY;

/**
 * Atualiza o status do pedido no banco de dados.
 * Executado de forma assíncrona para cumprir o RNF-02 (resposta rápida).
 */
async function atualizarStatusDoIngresso(externalReference, isApproved) {
  const novoStatus = isApproved ? 'approved' : 'rejected';
  const result = stmts.updateStatus({ status: novoStatus, externalReference });

  if (result.changes === 0) {
    console.warn(`[Webhook] Pedido não encontrado para externalReference: ${externalReference}`);
  } else {
    console.log(`[Webhook] Pedido ${externalReference} atualizado para: ${novoStatus}`);
  }
}

/**
 * POST /webhooks/yaid
 * RF-BACK-03 / RF-BACK-04: Recebe eventos da YaID, valida assinatura Ed25519
 * e libera o ingresso se aprovado.
 */
router.post('/', async (req, res) => {
  try {
    // 1. Verifica presença do header de assinatura
    const signatureHeader = req.headers['x-yaid-signature'];
    if (!signatureHeader) {
      console.warn('[Webhook] Header x-yaid-signature ausente.');
      return res.status(401).send('Assinatura ausente');
    }

    if (!YAID_PUBLIC_KEY) {
      console.error('[Webhook] YAID_PUBLIC_KEY não configurada.');
      return res.status(500).send('Configuração interna ausente');
    }

    // 2. Valida assinatura criptográfica Ed25519 (RNF-01: usa rawBody)
    const signature = Buffer.from(signatureHeader, 'base64');
    const publicKey = Buffer.from(YAID_PUBLIC_KEY, 'base64');
    const message = req.rawBody;

    if (!message) {
      console.error('[Webhook] rawBody não disponível — verifique o middleware do Express.');
      return res.status(500).send('Erro de configuração de middleware');
    }

    const isAuthentic = await ed.verifyAsync(signature, message, publicKey);

    if (!isAuthentic) {
      console.warn('[Webhook] ⚠️  Assinatura inválida — possível tentativa de fraude.');
      return res.status(401).send('Assinatura inválida');
    }

    // 3. Processa o evento
    const event = req.body;
    console.log('[Webhook] Evento recebido:', JSON.stringify(event, null, 2));

    const externalReference = event?.externalReference || event?.external_reference;
    const isApproved = event?.status === 'approved';

    if (externalReference) {
      // RNF-02: Processamento assíncrono — não bloqueia o retorno HTTP
      atualizarStatusDoIngresso(externalReference, isApproved).catch((err) =>
        console.error('[Webhook] Erro ao atualizar DB:', err)
      );
    } else {
      console.warn('[Webhook] externalReference não encontrado no payload:', event);
    }

    // 4. Retorna 200 imediatamente para a YaID (RNF-02)
    return res.status(200).send('ok');
  } catch (error) {
    console.error('[Webhook] Erro inesperado:', error);
    return res.status(500).send('Erro interno');
  }
});

export default router;
