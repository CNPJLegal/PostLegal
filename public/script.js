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
  stories: { width: 1080, height: 1720 }
};

let currentFormat = "post";
let lastColor = null;
let lastContent = null;
let zoomLevel = 0.45;

const loader = document.createElement("div");
loader.innerText = "Gerando...";
loader.style.cssText = `
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 20px;
  background: rgba(0,0,0,0.8);
  padding: 12px 20px;
  border-radius: 8px;
  z-index: 999;
  display: none;
`;
document.body.appendChild(loader);

function applyZoom() {
  canvas.style.transform = `scale(${zoomLevel})`;
}
document.getElementById("zoomInBtn").addEventListener("click", () => {
  zoomLevel = Math.min(zoomLevel + 0.05, 1);
  applyZoom();
});
document.getElementById("zoomOutBtn").addEventListener("click", () => {
  zoomLevel = Math.max(zoomLevel - 0.05, 0.2);
  applyZoom();
});
applyZoom();

// Dados fixos
const posts = [/*... (os posts do seu Excel aqui) */];

// Gera variação aleatória para tema digitado
function gerarVariaçãoDeTema(temaBase) {
  const headlines = [
    `Tudo sobre ${temaBase} que ninguém te contou.`,
    `${temaBase}: entenda como aplicar na sua rotina.`,
    `${temaBase}: o que você precisa saber agora.`,
    `${temaBase} explicado de forma simples.`,
    `${temaBase} pode mudar seu negócio.`
  ];
  const subheadlines = [
    "Descubra como isso impacta diretamente seu sucesso.",
    "Entenda por que isso é crucial no seu dia a dia.",
    "Evite os erros mais comuns com esse conhecimento.",
    "Dê o primeiro passo com clareza e confiança.",
    "Veja o que os especialistas recomendam sobre o tema."
  ];
  const mensagens = [
    "Acesse agora e tenha um diagnóstico gratuito.",
    "Conte com a CNPJ Legal para te ajudar.",
    "Fale com um especialista em menos de 2 minutos.",
    "Tire suas dúvidas com quem entende.",
    "Descubra tudo com um clique."
  ];
  const legendas = [
    "Este conteúdo foi gerado com base no seu tema. Legal, né?",
    "Um bom tema rende bons insights. Aqui está o seu.",
    "Seu post foi criado automaticamente. Experimente outros!",
    "Quer ver mais? Troque o tema e gere de novo.",
    "Cada clique, uma ideia. Aqui está mais uma!"
  ];
  const tags = "#CNPJLegal #MarketingMEI #EmpreenderComSegurança #PostInteligente #AutomaçãoCriativa";

  return {
    tema: temaBase,
    headline: random(headlines),
    subheadline: random(subheadlines),
    mensagem: random(mensagens),
    legenda: random(legendas),
    tags
  };
}

function buscarConteudoPorTema(tema) {
  const match = posts.find(p => p.Tema.toLowerCase().includes(tema.toLowerCase()));
  if (match) {
    return {
      tema: match.Tema,
      headline: match.Headline,
      subheadline: match.Subheadline,
      mensagem: match.CTA,
      legenda: match.Legenda,
      tags: match.Tags
    };
  }
  return gerarVariaçãoDeTema(tema);
}

function random(array) {
  return array[Math.floor(Math.random() * array.length)];
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

async function drawPost({ tema, headline, subheadline, mensagem, legenda, tags, format, color }) {
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

  let textColor = (color === "branco" || color === "verde") ? "#000" : "#fff";
  ctx.textAlign = "center";

  ctx.font = "bold 46px Inter";
  ctx.fillStyle = (color === "verde") ? "#000" : (color === "branco") ? "#0f3efa" : "#17e30d";
  wrapText(headline, width / 2, height / 2 - 200, width * 0.85, 50);

  ctx.font = "28px Inter";
  ctx.fillStyle = textColor;
  wrapText(subheadline, width / 2, height / 2 - 80, width * 0.75, 34);

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

  document.getElementById("postInfo").style.display = "block";
  document.getElementById("caption").innerText = legenda;
  document.getElementById("tags").innerText = tags;
}

document.getElementById("generateBtn").addEventListener("click", async () => {
  loader.style.display = "block";

  const themeInput = document.getElementById("themeInput").value.trim();
  const conteudo = buscarConteudoPorTema(themeInput || random(posts).Tema);
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

  setTimeout(() => loader.style.display = "none", 200); // Esconde loader
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
    lastColor = btn.dataset.color === "aleatoria" ? null : btn.dataset.color;

    const corFinal = lastColor || getRandomColor();
    if (lastContent) drawPost({ ...lastContent, format: currentFormat, color: corFinal });
  });
});

document.querySelectorAll(".dimension-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    currentFormat = btn.dataset.format;
    const corFinal = lastColor || getRandomColor();
    if (lastContent) drawPost({ ...lastContent, format: currentFormat, color: corFinal });
  });
});

function getRandomColor() {
  const keys = Object.keys(colors);
  return keys[Math.floor(Math.random() * keys.length)];
}
