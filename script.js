const API_KEY = "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"; // Troque pela sua chave real válida

const canvas = document.getElementById("postCanvas");
const ctx = canvas.getContext("2d");

const colors = {
  azul: "#0f3efa",
  verde: "#17e30d",
  preto: "#1c1c1c",
  branco: "#ffffff"
};

const formats = {
  quadrado: { width: 1080, height: 1080 },
  post: { width: 1080, height: 1350 },
  stories: { width: 1080, height: 1920 }
};

let currentFormat = "post";
let lastColor = "azul";
let lastContent = null;

async function chamarIA(prompt) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://seudominio.com",
        "X-Title": "Gerador CNPJ Legal"
      },
      body: JSON.stringify({
        model: "openchat/openchat", // Ou "openai/gpt-3.5-turbo" se preferir
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8
      })
    });

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    return content || "";
  } catch (e) {
    console.error("Erro na IA:", e);
    return "Erro ao gerar conteúdo com IA.";
  }
}

async function gerarTemaIA() {
  const prompt = `
Gere 5 temas criativos e atuais para posts no Instagram sobre:
- abrir CNPJ
- dúvidas fiscais
- microempreendedores
Responda somente com uma lista.`;

  const texto = await chamarIA(prompt);
  const temas = texto.split("\n").map(l => l.replace(/^[\d\-\*\.]+\s*/, "").trim()).filter(Boolean);
  return temas[Math.floor(Math.random() * temas.length)] || "Empreendedorismo Legal";
}

async function gerarConteudoIA(tema) {
  const prompt = `
TEMA: ${tema}
Crie para um post da marca CNPJ Legal:
HEADLINE: título impactante
SUBHEADLINE: reforço útil
MENSAGEM: frase prática`;

  const texto = await chamarIA(prompt);
  const extract = campo => {
    const match = texto.match(new RegExp(`${campo}:\\s*(.+)`, "i"));
    return match?.[1]?.trim() || "";
  };

  return {
    tema,
    headline: extract("HEADLINE"),
    subheadline: extract("SUBHEADLINE"),
    mensagem: extract("MENSAGEM")
  };
}

async function drawPost({ tema, headline, subheadline, mensagem, format, color }) {
  const { width, height } = formats[format];
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  // ✅ Textura
  const texture = new Image();
  texture.src = "https://iili.io/FrLiI5P.png";
  texture.crossOrigin = "anonymous";
  try {
    await new Promise((res, rej) => {
      texture.onload = res;
      texture.onerror = rej;
    });
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(texture, 0, 0, width, height);
    ctx.restore();
  } catch (err) {
    console.warn("Erro ao carregar textura:", err);
  }

  // ✅ Textos
  ctx.fillStyle = color === "branco" ? "#000" : "#fff";
  ctx.textAlign = "center";

  ctx.font = "bold 24px Inter";
  ctx.fillText(tema, width / 2, height / 2 - 200);

  ctx.font = "bold 48px Inter";
  ctx.fillText("CNPJ Legal", width / 2, height / 2 - 150);

  ctx.font = "bold 38px Inter";
  ctx.fillText(headline, width / 2, height / 2 - 80);

  ctx.font = "28px Inter";
  ctx.fillText(subheadline, width / 2, height / 2 - 30);

  ctx.font = "20px Inter";
  ctx.fillText(mensagem, width / 2, height / 2 + 30);

  // ✅ Logotipo no rodapé centralizado
  const logo = new Image();
  logo.src = "https://iili.io/J9PC4Hg.png"; // Substitua pelo seu logo PNG transparente
  logo.crossOrigin = "anonymous";
  try {
    await new Promise((res, rej) => {
      logo.onload = res;
      logo.onerror = rej;
    });

    const logoWidth = 150;
    const logoHeight = logo.height * (logoWidth / logo.width);
    const x = (width - logoWidth) / 2;
    const y = height - logoHeight - 40;
    ctx.drawImage(logo, x, y, logoWidth, logoHeight);
  } catch (e) {
    console.warn("Erro ao carregar logotipo:", e);
  }
}

// Botões principais
document.getElementById("generateBtn").addEventListener("click", async () => {
  const themeInput = document.getElementById("themeInput").value.trim();
  const temaFinal = themeInput || await gerarTemaIA();
  const conteudo = await gerarConteudoIA(temaFinal);
  lastContent = conteudo;

  await drawPost({ ...conteudo, format: currentFormat, color: lastColor });
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "post-cnpj-legal.png";
  link.href = canvas.toDataURL();
  link.click();
});

// Cores
document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    lastColor = btn.dataset.color;
    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    if (lastContent) {
      drawPost({ ...lastContent, format: currentFormat, color: lastColor });
    }
  });
});

// Formatos
document.querySelectorAll(".dimension-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentFormat = btn.dataset.format;
    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    if (lastContent) {
      drawPost({ ...lastContent, format: currentFormat, color: lastColor });
    }
  });
});

// Cor aleatória se não definida
function getRandomColor() {
  const keys = Object.keys(colors).filter(k => k !== lastColor);
  return keys[Math.floor(Math.random() * keys.length)];
}
