// script.js completo e funcional

const canvas = document.getElementById("postCanvas");
const ctx = canvas.getContext("2d");
const editableTextContainer = document.getElementById("editableTextContainer");

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

const textos = [
  {
    headline: "Empreenda com CNPJ Legal",
    subheadline: "Cuidamos do seu CNPJ do início ao sucesso.",
    mensagem: "Clique no link da bio e faça seu diagnóstico gratuito."
  }
];

function getRandomText() {
  return textos[Math.floor(Math.random() * textos.length)];
}

function applyZoom() {
  const container = canvas.parentElement;
  container.style.transform = `scale(${zoomLevel})`;
  container.style.transformOrigin = "top left";
}

function resizeCanvas(formatKey) {
  currentFormat = formatKey;
  const format = formats[formatKey];
  canvas.width = format.width;
  canvas.height = format.height;
  applyZoom();
  generatePost();
}

function drawText(text, x, y, size, color = "#000", weight = "normal") {
  ctx.font = `${weight} ${size}px Inter`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function wrapText(text, x, y, maxWidth, lineHeight, fontSize, color, weight) {
  const words = text.split(" ");
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      drawText(line, x, y, fontSize, color, weight);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  drawText(line, x, y, fontSize, color, weight);
}

function generatePost() {
  const color = document.querySelector(".color-btn.selected").dataset.color;
  const format = formats[currentFormat];
  const content = getRandomText();

  lastColor = color;
  lastContent = content;

  const bgColor = color === "aleatoria" ? getRandomColor() : colors[color];

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.src = logos[color === "aleatoria" ? "azul" : color];

  logo.onload = () => {
    ctx.drawImage(logo, canvas.width - 250, canvas.height - 250, 180, 180);
    renderText(content);
  };
}

function renderText(content) {
  const format = formats[currentFormat];
  const x = 80;
  let y = format.topOffset;

  wrapText(content.headline, x, y, canvas.width - 160, 60, 60, "#fff", "bold");
  y += 160;
  wrapText(content.subheadline, x, y, canvas.width - 160, 50, 40, "#fff", "normal");
  y += 120;
  wrapText(content.mensagem, x, y, canvas.width - 160, 40, 32, "#fff", "normal");
}

function getRandomColor() {
  const values = Object.values(colors);
  return values[Math.floor(Math.random() * values.length)];
}

function downloadPost() {
  const link = document.createElement("a");
  link.download = "post-cnpj-legal.png";
  link.href = canvas.toDataURL();
  link.click();
}

// Eventos

document.getElementById("generateBtn").addEventListener("click", generatePost);
document.getElementById("downloadBtn").addEventListener("click", downloadPost);
document.getElementById("zoomInBtn").addEventListener("click", () => {
  zoomLevel += 0.05;
  applyZoom();
});
document.getElementById("zoomOutBtn").addEventListener("click", () => {
  zoomLevel -= 0.05;
  applyZoom();
});

document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

document.querySelectorAll(".dimension-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    resizeCanvas(btn.dataset.format);
  });
});

// Inicialização
resizeCanvas(currentFormat);
