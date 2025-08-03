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

async function gerarConteudoIA(tema) {
  try {
    return {
      tema,
      headline: tema || "(HEADLINE não encontrada)",
      subheadline: "Abra seu CNPJ com facilidade e segurança.",
      mensagem: "Clique no link da bio para começar hoje mesmo!"
    };
  } catch (e) {
    console.warn("⚠️ Falha ao gerar conteúdo IA:", e);
    return {
      tema,
      headline: "(HEADLINE não encontrada)",
      subheadline: "(SUBHEADLINE não encontrada)",
      mensagem: "(MENSAGEM não encontrada)"
    };
  }
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

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  lines.forEach((l, i) => {
    ctx.fillText(l, x, y + i * lineHeight);
  });
}

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

  // Vinheta radial escura do topo
  const gradient = ctx.createRadialGradient(width / 2, 0, 100, width / 2, height / 2, height);
  gradient.addColorStop(0, "rgba(0,0,0,0.4)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Cor do texto
  let textColor = "#fff";
  if (color === "branco" || color === "verde") textColor = "#000";
  ctx.textAlign = "center";

  // Tema (acima da headline)
  ctx.font = "bold 24px Inter";
  ctx.fillStyle = textColor;
  wrapText(tema, width / 2, height / 2 - 280, width * 0.8, 30);

  // Headline (em destaque)
  ctx.font = "bold 46px Inter";
  ctx.fillStyle =
    color === "verde" ? "#000" :
    color === "branco" ? "#0f3efa" :
    "#17e30d";
  wrapText(headline, width / 2, height / 2 - 200, width * 0.9, 50);

  // Subheadline
  ctx.font = "28px Inter";
  ctx.fillStyle = textColor;
  wrapText(subheadline, width / 2, height / 2 - 80, width * 0.75, 34);

  // CTA
  ctx.font = "20px Inter";
  wrapText(mensagem, width / 2, height / 2, width * 0.7, 28);

  try {
    const logo = await carregarImagem(logos[color]);
    const logoWidth = 160;
    const logoHeight = logo.height * (logoWidth / logo.width);
    ctx.drawImage(logo, (width - logoWidth) / 2, height - logoHeight - 40, logoWidth, logoHeight);
  } catch (e) {
    console.warn("Erro ao carregar logo:", e);
  }
}

document.getElementById("generateBtn").addEventListener("click", async () => {
  const themeInput = document.getElementById("themeInput").value.trim();
  const temaFinal = themeInput || await gerarTemaIA();
  const conteudo = await gerarConteudoIA(temaFinal);
  lastContent = conteudo;

  const selectedColorBtn = document.querySelector(".color-btn.selected");
  const userColorChoice = selectedColorBtn?.dataset?.color;

  const color = !userColorChoice || userColorChoice === "aleatoria"
    ? getRandomColor()
    : userColorChoice;

  if (userColorChoice === "aleatoria") {
    document.querySelectorAll(".color-btn").forEach(b => {
      b.classList.toggle("selected", b.dataset.color === "aleatoria");
    });
  }

  lastColor = color;
  await drawPost({ ...conteudo, format: currentFormat, color });
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "post-cnpj-legal.png";
  link.href = canvas.toDataURL();
  link.click();
});

document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    const corSelecionada = btn.dataset.color;
    lastColor = corSelecionada === "aleatoria" ? null : corSelecionada;

    if (lastContent && lastColor) {
      drawPost({ ...lastContent, format: currentFormat, color: lastColor });
    } else if (lastContent && !lastColor) {
      const corAleatoria = getRandomColor();
      drawPost({ ...lastContent, format: currentFormat, color: corAleatoria });
    }
  });
});

document.querySelectorAll(".dimension-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    currentFormat = btn.dataset.format;

    if (lastContent) {
      const color = lastColor || getRandomColor();
      drawPost({ ...lastContent, format: currentFormat, color });
    }
  });
});

function getRandomColor() {
  const keys = Object.keys(colors);
  return keys[Math.floor(Math.random() * keys.length)];
}
