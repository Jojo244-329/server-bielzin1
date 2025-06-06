import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import axios from 'axios';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/gerar-pix', async (req, res) => {
  console.log("✅ Requisição recebida no endpoint /api/gerar-pix");
  console.log("📦 Body recebido:", req.body);

  try {
    const { name, document } = req.body || {};

    const client = {
      name: name || "Cliente Teste",
      email: "cliente@email.com",
      phone: "11999999999",
      document: document || "12345678900"
    };

    console.log("👤 Dados do cliente formatados:", client);

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

    console.log("📡 Enviando payload para OneTimePay:", payloadGateway);

    const resposta = await axios.post(
  'https://app.onetimepay.com.br/api/v1/gateway/pix/receive',
  payloadGateway,
  {
    headers: {
      'x-public-key': 'yt0313861_y42n57er76i3n8iu',
      'x-secret-key': '7w9xbx75ijwk7ewxd4soizd7giiwrn5e416n5mjsub4qa8vgrrb1tntk1pfzzpj6',
      'Content-Type': 'application/json'
    },
    timeout: 8000 // ⏰ 8 segundos no máximo
  }
);

    console.log("✅ PIX gerado com sucesso:", resposta.data);

    return res.status(200).json({
      pixCode: resposta.data.pix.code,
      pixQrCodeBase64: resposta.data.pix.base64,
      orderId: resposta.data.order.id,
      orderUrl: resposta.data.order.url,
      transactionId: resposta.data.transactionId
    });

  } catch (error) {
    console.error("❌ Erro ao gerar Pix:", error);

    if (error.response) {
      console.error("🔴 Erro detalhado:", error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({ error: error.message });
  }
});

export default serverless(app);
