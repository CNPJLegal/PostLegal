export default async function handler(req, res) {
  // 🔒 Permite apenas requisições GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const apiKey = process.env.NEWSDATA_API_KEY;

  // ⚠️ Verifica se a chave da API está definida nas variáveis de ambiente
  if (!apiKey) {
    return res.status(500).json({ error: "API KEY não configurada no ambiente" });
  }

  try {
    const response = await fetch(`https://newsdata.io/api/1/news?apikey=${apiKey}&q=MEI,CNPJ,empreendedorismo&language=pt`);
    const data = await response.json();

    // 🧠 Extrai títulos das notícias relevantes
    const manchetes = data.results?.map(item => item.title).filter(Boolean);

    // 🪂 Fallback em caso de lista vazia
    const tema = manchetes?.[Math.floor(Math.random() * manchetes.length)] || "Como abrir seu CNPJ com segurança";

    return res.status(200).json({ tema });
  } catch (err) {
    console.error("Erro ao buscar manchetes da NewsData:", err);
    return res.status(500).json({ error: "Erro ao buscar dados externos" });
  }
}
