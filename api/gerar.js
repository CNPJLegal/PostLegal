export default async function handler(req, res) {
  // Método permitido apenas POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { prompt } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  // Checa se chave da API foi setada corretamente no ambiente
  if (!apiKey) {
    console.error("❌ Variável OPENAI_API_KEY não está definida no ambiente Vercel");
    return res.status(500).json({ error: "Chave da API não configurada." });
  }

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt inválido ou ausente." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro da OpenAI:", data);
      return res.status(500).json({ error: data.error?.message || "Erro da OpenAI" });
    }

    const result = data.choices?.[0]?.message?.content;
    if (!result) {
      console.error("⚠️ Resposta sem conteúdo:", data);
      return res.status(500).json({ error: "Resposta inválida da OpenAI" });
    }

    return res.status(200).json({ result });

  } catch (err) {
    console.error("❌ Erro ao chamar API:", err);
    return res.status(500).json({ error: "Erro ao chamar a API da OpenAI" });
  }
}
