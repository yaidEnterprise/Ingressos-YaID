/**
 * db.js — Persistência de dados usando better-sqlite3 (SQLite nativo).
 * Síncrono, rápido e sem dependências externas de runtime.
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'orders.db');

// Abre (ou cria) o banco de dados SQLite
const db = new Database(DB_PATH);

// Configurações de performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// ──────────────────────────────────────────────
// Criação da tabela (se não existir)
// ──────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id                TEXT PRIMARY KEY,
    externalReference TEXT UNIQUE NOT NULL,
    status            TEXT NOT NULL DEFAULT 'pending',
    proofRequestId    TEXT,
    verificationUrl   TEXT,
    createdAt         INTEGER NOT NULL,
    updatedAt         INTEGER NOT NULL
  );
`);

console.log('[DB] SQLite conectado →', DB_PATH);

// ──────────────────────────────────────────────
// Prepared statements — equivalente à API LokiJS
// ──────────────────────────────────────────────

export const stmts = {
  /**
   * Cria um novo pedido com status 'pending'.
   */
  createOrder: db.prepare(`
    INSERT INTO orders (id, externalReference, status, proofRequestId, verificationUrl, createdAt, updatedAt)
    VALUES (@id, @externalReference, 'pending', NULL, NULL, @createdAt, @updatedAt)
  `),

  /**
   * Atualiza o pedido com dados retornados pela YaID.
   */
  updateProofRequest: db.prepare(`
    UPDATE orders
    SET proofRequestId = @proofRequestId,
        verificationUrl = @verificationUrl,
        updatedAt = @updatedAt
    WHERE id = @id
  `),

  /**
   * Atualiza o status de um pedido pela externalReference (usada no webhook).
   */
  updateStatus: db.prepare(`
    UPDATE orders
    SET status = @status,
        updatedAt = @updatedAt
    WHERE externalReference = @externalReference
  `),

  /**
   * Busca um pedido pelo ID interno.
   */
  getOrderById: db.prepare(`
    SELECT * FROM orders WHERE id = ?
  `),

  /**
   * Busca um pedido pela externalReference.
   */
  getOrderByRef: db.prepare(`
    SELECT * FROM orders WHERE externalReference = ?
  `),
};

// dbReady é exportado apenas para manter compatibilidade com código existente
export const dbReady = Promise.resolve();

export default db;
