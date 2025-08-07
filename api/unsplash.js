export default async function handler(req, res) {
  const { query } = req.query;
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return res.status(500).json({ error: "Access key não configurada." });
  }

  try {
    const apiUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=portrait&client_id=${accessKey}&t=${Date.now()}`;
    
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();

    if (!data.urls?.regular) {
      return res.status(500).json({ error: "Imagem não encontrada." });
    }

    res.setHeader("Cache-Control", "no-store"); // 🔥 desativa cache
    res.status(200).json({ url: data.urls.regular });
  } catch (error) {
    console.error("Erro na API do Unsplash:", error);
    res.status(500).json({ error: "Erro ao buscar imagem do Unsplash." });
  }
}
