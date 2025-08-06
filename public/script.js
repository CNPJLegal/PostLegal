// script.js COMPLETO ATUALIZADO

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
let backgroundImage = null;

function generateContent() {
  return {
    headline: "Empreenda com CNPJ Legal",
    subheadline: "Cuidamos do seu CNPJ do início ao sucesso",
    mensagem: "Clique no link da bio e regularize agora mesmo!"
  };
}

function applyZoom() {
  const container = canvas.parentElement;
  canvas.style.transform = `scale(${zoomLevel})`;
  canvas.style.transformOrigin = "top left";
  container.style.height = `${canvas.height * zoomLevel}px`;
  container.style.width = `${canvas.width * zoomLevel}px`;
}

function drawPost() {
  const { width, height, topOffset } = formats[currentFormat];
  canvas.width = width;
  canvas.height = height;
  
  const selectedColor = lastColor || Object.keys(colors)[Math.floor(Math.random() * Object.keys(colors).length)];
  const bgColor = colors[selectedColor];
  const logo = logos[selectedColor];

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  if (backgroundImage) {
    ctx.globalAlpha = 0.15;
    ctx.drawImage(backgroundImage, 0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  const content = lastContent || generateContent();

  ctx.fillStyle = selectedColor === 'branco' ? '#000' : '#fff';
  ctx.font = "bold 48px Inter";
  ctx.textAlign = "center";
  ctx.fillText(content.headline, width / 2, topOffset + 50);

  ctx.font = "24px Inter";
  ctx.fillText(content.subheadline, width / 2, topOffset + 110);

  ctx.font = "20px Inter";
  ctx.fillText(content.mensagem, width / 2, topOffset + 170);

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, width - 300, height - 150, 250, 80);
  };
  img.src = logo;

  lastColor = selectedColor;
  lastContent = content;
}

function handleGenerateClick() {
  lastContent = generateContent();
  drawPost();
}

function handleFormatChange(format) {
  currentFormat = format;
  drawPost();
}

document.getElementById("generateBtn").addEventListener("click", handleGenerateClick);
document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "post-cnpj-legal.png";
  link.href = canvas.toDataURL();
  link.click();
});

document.getElementById("zoomInBtn").addEventListener("click", () => {
  zoomLevel = Math.min(1, zoomLevel + 0.05);
  applyZoom();
});

document.getElementById("zoomOutBtn").addEventListener("click", () => {
  zoomLevel = Math.max(0.1, zoomLevel - 0.05);
  applyZoom();
});

Array.from(document.querySelectorAll(".color-btn")).forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    lastColor = btn.dataset.color === "aleatoria" ? null : btn.dataset.color;
    drawPost();
  });
});

Array.from(document.querySelectorAll(".dimension-btn")).forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    handleFormatChange(btn.dataset.format);
  });
});

document.getElementById("changeImageBtn").addEventListener("click", () => {
  backgroundImage = null;
  drawPost();
});

document.getElementById("uploadImageInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = () => {
      backgroundImage = img;
      drawPost();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  lastContent = null;
  lastColor = null;
  backgroundImage = null;
  drawPost();
});

document.getElementById("undoBtn").addEventListener("click", () => {
  // futuro: histórico de estados
});

document.getElementById("redoBtn").addEventListener("click", () => {
  // futuro: refazer último
});

drawPost();
applyZoom();
