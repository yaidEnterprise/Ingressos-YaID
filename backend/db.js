/**
 * db.js — Persistência de dados usando LokiJS (JSON em arquivo local).
 * Não requer compilação nativa, funciona em qualquer ambiente Node.js.
 *
 * Substitui better-sqlite3 que exige Visual Studio/C++ Build Tools no Windows.
 */

import Loki from 'lokijs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'orders.db.json');

// Cria instância LokiJS com persistência automática em arquivo JSON
const db = new Loki(DB_PATH, {
  autosave: true,
  autosaveInterval: 2000, // Salva a cada 2 segundos
  autoload: true,
  autoloadCallback: initDatabase,
  serializationMethod: 'pretty',
});

let ordersCollection;

function initDatabase() {
  // Carrega ou cria a coleção de pedidos
  ordersCollection = db.getCollection('orders');
  if (!ordersCollection) {
    ordersCollection = db.addCollection('orders', {
      indices: ['id', 'externalReference'],
      unique: ['id', 'externalReference'],
    });
    console.log('[DB] Coleção "orders" criada.');
  } else {
    console.log(`[DB] Coleção "orders" carregada (${ordersCollection.count()} pedidos).`);
  }
}

// Aguarda o carregamento do banco antes de exportar os métodos
function waitForDb() {
  return new Promise((resolve) => {
    if (ordersCollection) {
      resolve();
    } else {
      // LokiJS autoload é síncrono internamente mas o callback pode ser async
      setTimeout(() => {
        if (!ordersCollection) initDatabase();
        resolve();
      }, 100);
    }
  });
}

// ──────────────────────────────────────────────
// API pública — equivalente aos stmts do SQLite
// ──────────────────────────────────────────────

export const dbReady = waitForDb();

export const stmts = {
  /**
   * Cria um novo pedido com status 'pending'.
   */
  createOrder: ({ id, externalReference }) => {
    if (!ordersCollection) initDatabase();
    return ordersCollection.insert({
      id,
      externalReference,
      status: 'pending',
      proofRequestId: null,
      verificationUrl: null,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    });
  },

  /**
   * Atualiza o pedido com dados retornados pela YaID.
   */
  updateProofRequest: ({ id, proofRequestId, verificationUrl }) => {
    if (!ordersCollection) initDatabase();
    const order = ordersCollection.findOne({ id });
    if (order) {
      order.proofRequestId = proofRequestId;
      order.verificationUrl = verificationUrl;
      order.updatedAt = Math.floor(Date.now() / 1000);
      ordersCollection.update(order);
    }
  },

  /**
   * Atualiza o status de um pedido pela externalReference (usada no webhook).
   */
  updateStatus: ({ status, externalReference }) => {
    if (!ordersCollection) initDatabase();
    const order = ordersCollection.findOne({ externalReference });
    if (order) {
      order.status = status;
      order.updatedAt = Math.floor(Date.now() / 1000);
      ordersCollection.update(order);
      return { changes: 1 };
    }
    return { changes: 0 };
  },

  /**
   * Busca um pedido pelo ID interno.
   */
  getOrderById: (id) => {
    if (!ordersCollection) initDatabase();
    return ordersCollection.findOne({ id });
  },

  /**
   * Busca um pedido pela externalReference.
   */
  getOrderByRef: (externalReference) => {
    if (!ordersCollection) initDatabase();
    return ordersCollection.findOne({ externalReference });
  },
};

export default db;
