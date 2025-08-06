// 👇 Aqui está o código completo atualizado do script.js
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
  quadrado: { width: 1080, height: 1080, topOffset: 120 },
  post: { width: 1080, height: 1350, topOffset: 120 },
  stories: { width: 1080, height: 1720, topOffset: 236 }
};

let currentFormat = "post";
let lastColor = null;
let lastContent = null;
let zoomLevel = 0.45;
let cachedImage = null;

const textos = {
  headline: "Empreenda com CNPJ Legal",
  subheadline: "Cuidamos do seu CNPJ do início ao sucesso",
  cta: "Clique no link da bio e regularize já"
};

function resizeCanvas() {
  const { width, height } = formats[currentFormat];
  canvas.width = width;
  canvas.height = height;
  canvas.style.transform = `scale(${zoomLevel})`;
  canvas.style.transformOrigin = "top left";
}

function drawPost(corSelecionada = "aleatoria") {
  if (corSelecionada === "aleatoria") {
    const corKeys = Object.keys(colors).filter(c => c !== lastColor);
    corSelecionada = corKeys[Math.floor(Math.random() * corKeys.length)];
  }
  lastColor = corSelecionada;
  const cor = colors[corSelecionada];

  resizeCanvas();
  ctx.fillStyle = cor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.src = logos[corSelecionada];
  logo.onload = () => {
    const logoSize = 130;
    ctx.drawImage(logo, canvas.width - logoSize - 40, 40, logoSize, logoSize);
  };

  ctx.fillStyle = corSelecionada === "branco" ? "#000" : "#fff";
  ctx.font = "bold 52px Inter";
  ctx.textAlign = "center";
  ctx.fillText(textos.headline, canvas.width / 2, formats[currentFormat].topOffset + 40);

  ctx.font = "28px Inter";
  ctx.fillText(textos.subheadline, canvas.width / 2, formats[currentFormat].topOffset + 100);

  ctx.font = "italic 24px Inter";
  ctx.fillText(textos.cta, canvas.width / 2, formats[currentFormat].topOffset + 160);
}

document.getElementById("generateBtn").addEventListener("click", () => {
  drawPost();
});

document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    drawPost(btn.dataset.color);
  });
});

document.querySelectorAll(".dimension-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    currentFormat = btn.dataset.format;
    drawPost(lastColor || "aleatoria");
  });
});

document.getElementById("zoomInBtn").addEventListener("click", () => {
  zoomLevel = Math.min(zoomLevel + 0.05, 1);
  drawPost(lastColor || "aleatoria");
});

document.getElementById("zoomOutBtn").addEventListener("click", () => {
  zoomLevel = Math.max(zoomLevel - 0.05, 0.2);
  drawPost(lastColor || "aleatoria");
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "post-cnpj-legal.png";
  link.href = canvas.toDataURL();
  link.click();
});

drawPost();
