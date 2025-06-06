const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/gerar-pix', async (req, res) => {
  console.log("🔔 Chamada recebida em /api/gerar-pix");
  const { name, document } = req.body;

  const client = {
    name: name || "Cliente Teste",
    email: "cliente@email.com",
    phone: "11999999999",
    document: document || "12345678900"
  };

  const products = [
    {
      id: "produto-fixo",
      name: "Pagamento taxa",
      quantity: 1,
      price: 78.47
    }
  ];

  const amountFinal = 78.47;
  const identifier = `id-${Date.now()}`;

  const dataAmanha = new Date();
  dataAmanha.setDate(dataAmanha.getDate() + 1);
  const dueDate = dataAmanha.toISOString().split('T')[0];

  const payloadGateway = {
    identifier,
    amount: amountFinal,
    client,
    products,
    dueDate,
    metadata: { key1: "value1", key2: "value2" },
    callbackUrl: "https://minha.api.com/pix/callback"
  };

  try {
    const resposta = await axios.post(
      'https://app.onetimepay.com.br/api/v1/gateway/pix/receive',
      payloadGateway,
      {
        headers: {
          'x-public-key': 'yt0313861_y42n57er76i3n8iu',
          'x-secret-key': '7w9xbx75ijwk7ewxd4soizd7giiwrn5e416n5mjsub4qa8vgrrb1tntk1pfzzpj6',
          'Content-Type': 'application/json'
        },
        timeout: 15000 // ⚠️ Força erro se demorar mais de 15s
      }
    );

    return res.status(200).json({
      pixCode: resposta.data.pix.code,
      pixQrCodeBase64: resposta.data.pix.base64,
      orderId: resposta.data.order.id,
      orderUrl: resposta.data.order.url,
      transactionId: resposta.data.transactionId
    });

  } catch (error) {
    console.error("❌ Erro ao gerar PIX:", error.message);
    return res.status(500).json({
      error: error.message,
      detalhe: error.response?.data || 'Erro interno no servidor'
    });
  }
});

// Exportação para Vercel
module.exports = app;
module.exports.handler = serverless(app);
