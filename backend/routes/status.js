import express from 'express';
import { stmts } from '../db.js';

const router = express.Router();

/**
 * GET /api/order/:id
 * Retorna o status atual de um pedido para polling do frontend (RF-FRONT-03).
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length < 10) {
      return res.status(400).json({ error: 'ID de pedido inválido.' });
    }

    const order = stmts.getOrderById.get(id);

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    // Retorna apenas os campos necessários ao frontend
    return res.status(200).json({
      id: order.id,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    });
  } catch (err) {
    console.error('[Status] Erro:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

export default router;
