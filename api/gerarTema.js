export default async function handler(req, res) {
  // Permite apenas GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const apiKey = process.env.NEWSDATA_API_KEY;

  // Verifica se a variável de ambiente está definida
  if (!apiKey) {
    return res.status(500).json({ error: "API KEY não configurada no ambiente" });
  }

  try {
    const response = await fetch(`https://newsdata.io/api/1/news?apikey=${apiKey}&q=MEI&language=pt`);
    const data = await response.json();

    const manchetes = data.results?.map(item => item.title).filter(Boolean);

    const tema = manchetes?.[Math.floor(Math.random() * manchetes.length)] || "Empreendedorismo Legal";

    return res.status(200).json({ tema });

  } catch (err) {
    console.error("Erro ao buscar manchetes:", err);
    return res.status(500).json({ error: "Erro ao buscar dados externos" });
  }
}
