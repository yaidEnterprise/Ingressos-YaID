# Especificação Técnica: Plataforma de Venda de Ingressos VIP


## 1. Visão Geral do Projeto
Este documento define os requisitos e o guia de implementação para um site teste de venda de ingressos para eventos/festas. O objetivo estrito deste projeto é validar a integração do checkout com a API da **YaID** (plataforma de verificação de identidade e credenciais verificáveis), exigindo a comprovação de maioridade legal (`age_over_18`) ou prova de humanidade (`personhood`) para a liberação do ingresso, prevenindo fraudes e cambistas automatizados.

**Stack Tecnológica Recomendada:**
*   **Frontend:** React (SPA)
*   **Backend:** Node.js com Express
*   **Integração:** YaID API (Documentação: https://yaid.com.br/docs)

---

## 2. Requisitos de Interface (Frontend)
A interface deve guiar o "holder" (comprador do ingresso) de forma intuitiva durante o bloqueio e redirecionamento de segurança.

*   **RF-FRONT-01 (Vitrine e Checkout):** Criar uma página inicial simples exibindo um evento fictício (ex: "Festa de Lançamento TCC"). O usuário deve poder clicar em um botão "Comprar Ingresso" ou "Garantir VIP".
*   **RF-FRONT-02 (Início da Sessão YaID):** Ao clicar em comprar, o frontend deve chamar a API interna do backend para registrar a intenção de compra. O backend devolverá a `verificationUrl` gerada pela YaID. O frontend deve redirecionar o navegador do usuário imediatamente para essa URL.
*   **RF-FRONT-03 (Páginas de Desfecho):** Implementar telas de sucesso ("Ingresso Liberado com Sucesso") e falha ("Verificação Recusada/Expirada"). O frontend pode implementar um mecanismo de *polling* (ex: consultando o status do pedido a cada 3 segundos) ou aguardar o redirecionamento pós-verificação, caso implementado.

---

## 3. Requisitos de Servidor (Backend)
O backend atua como cliente confidencial da YaID e orquestrador do pedido.

*   **RF-BACK-01 (Autenticação e Variáveis de Ambiente):** O servidor deve carregar as credenciais da YaID via `.env`:
    *   `YAID_API_KEY`: Utilizada no header `x-api-key` nas chamadas ativas.
    *   `YAID_PUBLIC_KEY`: Utilizada para validar assinaturas de webhooks (obtida via `GET /api/webhook-public-key`).
*   **RF-BACK-02 (Criação do Proof Request):** Expor uma rota (ex: `POST /api/checkout`) consumida pelo frontend. Esta rota deve:
    1.  Gerar um ID de pedido interno.
    2.  Fazer uma chamada `POST /api/proof-requests` para a YaID.
    3.  Enviar no payload: `"proofType": "age_over_18"` e `"externalReference": "<ID_DO_PEDIDO_INTERNO>"`.
    4.  Retornar a `session.verificationUrl` para o frontend.
*   **RF-BACK-03 (Recepção de Eventos - Webhook):** Implementar uma rota pública `POST /webhooks/yaid` a ser configurada no painel da YaID. 
*   **RF-BACK-04 (Liberação do Ingresso):** Se o evento recebido no webhook tiver o status `"approved"` e a assinatura for válida, buscar o pedido pela `externalReference` no banco de dados e marcá-lo como "Pago/Liberado".

---

## 4. Requisitos Não Funcionais Críticos
*   **RNF-01 (Preservação do Raw Body):** Para validação criptográfica (Ed25519) da assinatura do webhook, o Express DEVE preservar os bytes originais da requisição ANTES da serialização.
*   **RNF-02 (Desempenho do Webhook):** O processamento da liberação no banco de dados não deve bloquear o retorno do webhook. O endpoint deve retornar `HTTP 200 OK` para a YaID em menos de 10 segundos.
*   **RNF-03 (Ambiente de Testes):** Todo o fluxo inicial será construído apontando para o ambiente de homologação (`environment: "homol"`), permitindo a aprovação manual da verificação pelo Dashboard, sem a necessidade de fluxo real de credenciais via celular.
*   **RNF-04 (Exposição Local):** Durante o desenvolvimento, o backend precisará estar exposto publicamente via Ngrok para conseguir receber os webhooks do ambiente de homologação da YaID.

---

## 5. Snippet de Referência: Implementação Segura do Webhook (Node.js/Express)
O agente deve utilizar a estrutura abaixo como base para a recepção dos eventos, garantindo a validação da curva Ed25519 com a biblioteca `@noble/ed25519`.

```javascript
import express from 'express';
import * as ed from '@noble/ed25519';

const app = express();

// RNF-01: Preservando o buffer original para validação da assinatura
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf; 
  }
}));

const YAID_PUBLIC_KEY = process.env.YAID_PUBLIC_KEY; 

app.post('/webhooks/yaid', async (req, res) => {
  try {
    const signatureHeader = req.headers['x-yaid-signature'];
    if (!signatureHeader) return res.status(401).send('Assinatura ausente');

    // Validação criptográfica
    const signature = Buffer.from(signatureHeader, 'base64');
    const publicKey = Buffer.from(YAID_PUBLIC_KEY, 'base64');
    const message = req.rawBody; 

    const authentic = await ed.verifyAsync(signature, message, publicKey);

    if (!authentic) {
      console.warn('Tentativa de webhook com assinatura inválida.');
      return res.status(401).send('Assinatura inválida');
    }

    const event = req.body; 
    const isApproved = event.status === 'approved';
    
    // Processamento assíncrono para cumprir RNF-02 (Fast response)
    atualizarStatusDoIngresso(event.externalReference, isApproved)
      .catch(err => console.error('Erro na DB:', err));

    return res.status(200).send('ok');

  } catch (error) {
    return res.status(500).send('Erro interno');
  }
});

async function atualizarStatusDoIngresso(pedidoId, isApproved) {
  // Lógica de update no banco de dados do sistema de festas
}
```
