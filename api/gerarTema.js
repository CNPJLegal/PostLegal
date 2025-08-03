import cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Exemplo: buscar notícias do Sebrae
    const response = await fetch("https://www.sebrae.com.br/sites/PortalSebrae/artigos", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!response.ok) {
      throw new Error("Erro ao acessar o site do Sebrae");
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const manchetes = [];

    $("a.titulo-noticia, .card-title, h3").each((_, el) => {
      const titulo = $(el).text().trim();
      if (titulo && titulo.length > 10) {
        manchetes.push(titulo);
      }
    });

    if (!manchetes.length) {
      return res.status(404).json({ error: "Nenhum tema encontrado nas fontes confiáveis" });
    }

    const tema = manchetes[Math.floor(Math.random() * manchetes.length)];

    return res.status(200).json({ tema });

  } catch (err) {
    console.error("Erro ao buscar temas via scraping:", err.message);
    return res.status(500).json({ error: "Erro ao buscar temas externos (ex: Sebrae)" });
  }
}
