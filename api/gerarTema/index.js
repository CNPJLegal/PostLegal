import * as cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const response = await fetch("https://www.sebrae.com.br/sites/PortalSebrae/artigos", {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    const html = await response.text();

    const $ = cheerio.load(html);
    const temas = [];

    $("a").each((i, el) => {
      const texto = $(el).text().trim();
      if (texto.length > 30 && !texto.includes("Saiba mais")) {
        temas.push(texto);
      }
    });

    if (temas.length === 0) {
      return res.status(404).json({ error: "Nenhum tema encontrado." });
    }

    const tema = temas[Math.floor(Math.random() * temas.length)];
    return res.status(200).json({ tema });

  } catch (err) {
    console.error("Erro ao buscar tema do Sebrae:", err);
    return res.status(500).json({ error: "Erro ao buscar tema do Sebrae" });
  }
}
