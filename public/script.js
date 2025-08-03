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
  stories: { width: 1080, height: 1720 } // ⚠️ menor para caber tudo visível
};

let currentFormat = "post";
let lastColor = null;
let lastContent = null;

// 🧠 Busca tema via backend
async function gerarTemaIA() {
  try {
    const res = await fetch("/api/gerarTema");
    const data = await res.json();
    return data.tema || "Empreendedorismo Legal";
  } catch (e) {
    console.warn("⚠️ Falha ao buscar tema:", e);
    return "Empreendedorismo Legal";
  }
}

// 🧠 Gera conteúdo IA baseado no tema
async function gerarConteudoIA(tema) {
  return {
    tema,
    headline: tema,
    subheadline: "Abra seu CNPJ com facilidade e segurança.",
    mensagem: "Clique no link da bio para começar hoje mesmo!"
  };
}

// Carrega imagem externa
function carregarImagem(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// WrapText para texto quebrado automático
function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}

// 🖼️ Desenha o post no canvas
async function drawPost({ tema, headline, subheadline, mensagem, format, color }) {
  const { width, height } = formats[format];
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  try {
    const texture = await carregarImagem("https://iili.io/FrLiI5P.png");
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(texture, 0, 0, width, height);
    ctx.restore();
  } catch (e) {
    console.warn("Erro ao carregar textura:", e);
  }

  const gradient = ctx.createRadialGradient(width / 2, 0, 100, width / 2, height / 2, height);
  gradient.addColorStop(0, "rgba(0,0,0,0.4)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Estilo de texto
  let textColor = (color === "branco" || color === "verde") ? "#000" : "#fff";
  ctx.textAlign = "center";

  // Headline
  ctx.font = "bold 46px Inter";
  ctx.fillStyle = (color === "verde") ? "#000" : (color === "branco") ? "#0f3efa" : "#17e30d";
  wrapText(headline, width / 2, height / 2 - 200, width * 0.85, 50);

  // Subheadline
  ctx.font = "28px Inter";
  ctx.fillStyle = textColor;
  wrapText(subheadline, width / 2, height / 2 - 80, width * 0.75, 34);

  // Mensagem/CTA
  ctx.font = "20px Inter";
  wrapText(mensagem, width / 2, height / 2 + 20, width * 0.7, 28);

  try {
    const logo = await carregarImagem(logos[color]);
    const logoWidth = 140;
    const logoHeight = logo.height * (logoWidth / logo.width);
    ctx.drawImage(logo, (width - logoWidth) / 2, height - logoHeight - 50, logoWidth, logoHeight);
  } catch (e) {
    console.warn("Erro ao carregar logo:", e);
  }
}

// Geração
document.getElementById("generateBtn").addEventListener("click", async () => {
  const themeInput = document.getElementById("themeInput").value.trim();
  const temaFinal = themeInput || await gerarTemaIA();
  const conteudo = await gerarConteudoIA(temaFinal);
  lastContent = conteudo;

  const selectedColorBtn = document.querySelector(".color-btn-mini.selected");
  const userColorChoice = selectedColorBtn?.dataset?.color;

  const color = !userColorChoice || userColorChoice === "aleatoria"
    ? getRandomColor()
    : userColorChoice;

  if (userColorChoice === "aleatoria") {
    document.querySelectorAll(".color-btn-mini").forEach(b => {
      b.classList.toggle("selected", b.dataset.color === "aleatoria");
    });
  }

  lastColor = color;
  await drawPost({ ...conteudo, format: currentFormat, color });
});

// Download
document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "post-cnpj-legal.png";
  link.href = canvas.toDataURL();
  link.click();
});

// Cor
document.querySelectorAll(".color-btn-mini").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".color-btn-mini").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    const corSelecionada = btn.dataset.color;
    lastColor = corSelecionada === "aleatoria" ? null : corSelecionada;

    if (lastContent) {
      const corFinal = lastColor || getRandomColor();
      drawPost({ ...lastContent, format: currentFormat, color: corFinal });
    }
  });
});

// Formato
document.querySelectorAll(".dimension-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    currentFormat = btn.dataset.format;

    if (lastContent) {
      const corFinal = lastColor || getRandomColor();
      drawPost({ ...lastContent, format: currentFormat, color: corFinal });
    }
  });
});

// Cor aleatória
function getRandomColor() {
  const keys = Object.keys(colors);
  return keys[Math.floor(Math.random() * keys.length)];
}
