const canvas = document.getElementById("postCanvas");
const ctx = canvas.getContext("2d");

const colors = {
  azul: "#0f3efa",
  verde: "#17e30d",
  preto: "#1c1c1c",
  branco: "#ffffff"
};

const logos = {
  azul: "https://iili.io/Frik9yl.png",
  preto: "https://iili.io/Frik9yl.png",
  branco: "https://iili.io/Fri8NTl.png",
  verde: "https://iili.io/FryqWHG.png"
};

const formats = {
  quadrado: { width: 1080, height: 1080 },
  post: { width: 1080, height: 1350 },
  stories: { width: 1080, height: 1920 }
};

let currentFormat = "post";
let lastColor = null;
let lastContent = null;

async function chamarIA(prompt) {
  try {
    const res = await fetch("/api/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const json = await res.json();
    return json.result || "";
  } catch (err) {
    alert("Erro ao chamar IA.");
    return "";
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
  const temas = texto.split("\n").map(l => l.replace(/^[\d\-\*\.\s]+/, "").trim()).filter(Boolean);
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
  const extract = campo => texto.match(new RegExp(`${campo}:\\s*(.+)`, "i"))?.[1]?.trim() || "";
  return {
    tema,
    headline: extract("HEADLINE"),
    subheadline: extract("SUBHEADLINE"),
    mensagem: extract("MENSAGEM")
  };
}

function carregarImagem(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function drawPost({ tema, headline, subheadline, mensagem, format, color }) {
  const { width, height } = formats[format];
  canvas.width = width;
  canvas.height = height;

  // Fundo
  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  // Textura
  try {
    const texture = await carregarImagem("https://iili.io/FrLiI5P.png");
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(texture, 0, 0, width, height);
    ctx.restore();
  } catch (e) {
    console.warn("Erro ao carregar textura:", e);
  }

  // Textos
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

  // Logo
  try {
    const logo = await carregarImagem(logos[color]);
    const logoWidth = 120;
    const logoHeight = logo.height * (logoWidth / logo.width);
    ctx.drawImage(logo, (width - logoWidth) / 2, height - logoHeight - 40, logoWidth, logoHeight);
  } catch (e) {
    console.warn("Erro ao carregar logo:", e);
  }
}

// Botão GERAR
document.getElementById("generateBtn").addEventListener("click", async () => {
  const themeInput = document.getElementById("themeInput").value.trim();
  const temaFinal = themeInput || await gerarTemaIA();
  const conteudo = await gerarConteudoIA(temaFinal);
  lastContent = conteudo;

  const format = currentFormat;
  const color = lastColor || getRandomColor();
  lastColor = color;

  await drawPost({ ...conteudo, format, color });

  document.querySelectorAll(".color-btn").forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.color === color);
  });
});

// Botão BAIXAR
document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "post-cnpj-legal.png";
  link.href = canvas.toDataURL();
  link.click();
});

// Cor selecionada
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

// Formato selecionado
document.querySelectorAll(".dimension-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentFormat = btn.dataset.format;
    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    if (lastContent) {
      drawPost({ ...lastContent, format: currentFormat, color: lastColor || getRandomColor() });
    }
  });
});

function getRandomColor() {
  const keys = Object.keys(colors).filter(k => k !== lastColor);
  return keys[Math.floor(Math.random() * keys.length)];
}
