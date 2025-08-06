export default async function handler(req, res) {
  const { query } = req.query;
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return res.status(500).json({ error: "Access key não configurada." });
  }

  try {
    const apiResponse = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${accessKey}`);
    const data = await apiResponse.json();

    if (!data.urls) {
      return res.status(500).json({ error: "Imagem não encontrada." });
    }

    res.status(200).json({ url: data.urls.regular });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar imagem do Unsplash." });
  }
}
