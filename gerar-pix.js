const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const client = {
      name: client.name,
      email: "cliente@email.com",
      phone: "11999999999",
      document: client.document
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

    const resposta = await axios.post(
      'https://app.onetimepay.com.br/api/v1/gateway/pix/receive',
      payloadGateway,
      {
        headers: {
          'x-public-key': process.env.PUBLIC_KEY,
          'x-secret-key': process.env.SECRET_KEY,
          'Content-Type': 'application/json'
        }
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
    console.error("Erro ao gerar Pix:", error);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: error.message });
  }
};
