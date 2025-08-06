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

const decorativos = {
  escuro: {
    topRight: "https://iili.io/FPeHOiP.png", // "+" claro
    bottomLeft: "https://iili.io/FPe2AHg.png" // seta clara
  },
  claro: {
    topRight: "https://iili.io/FPeFE9n.png", // "+" escuro
    bottomLeft: "https://iili.io/FPeKPzG.png" // seta escura
  }
};

const formats = {
  quadrado: { width: 1080, height: 1080, topOffset: 80, spacingExtra: 50 },
  post: { width: 1080, height: 1350, topOffset: 120, spacingExtra: 50 },
  stories: { width: 1080, height: 1720, topOffset: 260, spacingExtra: 0 }
};

let currentFormat = "post";
let lastColor = null;
let lastContent = null;
let lastImageDataUrl = null;
let zoomLevel = 0.45;

function applyZoom() {
  canvas.style.transform = `scale(${zoomLevel})`;
  canvas.style.transformOrigin = "top";
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

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let lines = [];
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
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

async function getUnsplashImage(query) {
  const res = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!data.url) throw new Error(data.error || "Erro ao obter imagem da API.");
  return data.url;
}

async function drawPost({ tema, headline, subheadline, mensagem, legenda, tags, format, color }) {
  const { width, height, topOffset, spacingExtra } = formats[format];
  canvas.width = width;
  canvas.height = height;

  ctx.globalAlpha = 1;
  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  // Overlay efeito multiply (2x)
  try {
    const overlay = await carregarImagem("https://iili.io/FrLiI5P.png");
    for (let i = 0; i < 2; i++) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(overlay, 0, 0, width, height);
      ctx.restore();
    }
  } catch (e) {
    console.warn("Erro ao aplicar overlay:", e);
  }

  // Elementos gráficos + e seta (sem distorção)
  try {
    const isClaro = (color === "verde" || color === "branco");
    const set = isClaro ? decorativos.claro : decorativos.escuro;

    const topRightImg = await carregarImagem(set.topRight);
    const bottomLeftImg = await carregarImagem(set.bottomLeft);

    // Desenhar "+" no topo direito (sem distorcer)
    const topRightWidth = topRightImg.width;
    const topRightHeight = topRightImg.height;
    ctx.drawImage(topRightImg, width - topRightWidth - 85, 93, topRightWidth, topRightHeight);

    // Desenhar seta no canto inferior esquerdo (sem distorcer)
    const bottomLeftWidth = bottomLeftImg.width;
    const bottomLeftHeight = bottomLeftImg.height;
    ctx.drawImage(bottomLeftImg, 27, height - bottomLeftHeight - 143, bottomLeftWidth, bottomLeftHeight);
  } catch (e) {
    console.warn("Erro ao carregar elementos decorativos:", e);
  }

  // Imagem principal com bordas
  let imageBottomY = 0;
  try {
    const img = await carregarImagem(lastImageDataUrl);
    const imageWidth = 835;
    const imageHeight = (img.height / img.width) * imageWidth;
    const imageX = (width - imageWidth) / 2;
    const imageY = topOffset;
    imageBottomY = imageY + imageHeight;

    const radius = 80;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(imageX + radius, imageY);
    ctx.lineTo(imageX + imageWidth - radius, imageY);
    ctx.quadraticCurveTo(imageX + imageWidth, imageY, imageX + imageWidth, imageY + radius);
    ctx.lineTo(imageX + imageWidth, imageY + imageHeight - radius);
    ctx.quadraticCurveTo(imageX + imageWidth, imageY + imageHeight, imageX + imageWidth - radius, imageY + imageHeight);
    ctx.lineTo(imageX + radius, imageY + imageHeight);
    ctx.quadraticCurveTo(imageX, imageY + imageHeight, imageX, imageY + imageHeight - radius);
    ctx.lineTo(imageX, imageY + radius);
    ctx.quadraticCurveTo(imageX, imageY, imageX + radius, imageY);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight);
    ctx.restore();
  } catch (e) {
    console.warn("Erro ao carregar imagem principal:", e);
  }

  // Gradiente superior
  const gradient = ctx.createRadialGradient(width / 2, 0, 100, width / 2, height / 2, height);
  gradient.addColorStop(0, "rgba(0,0,0,0.15)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Textos
  const baseY = imageBottomY + 40 + spacingExtra;
  ctx.textAlign = "center";
  const textColor = (color === "branco" || color === "verde") ? "#000" : "#fff";

  ctx.font = "bold 46px Inter";
  ctx.fillStyle = (color === "verde") ? "#000" : (color === "branco") ? "#0f3efa" : "#17e30d";
  wrapText(headline, width / 2, baseY, width * 0.85, 50);

  ctx.font = "28px Inter";
  ctx.fillStyle = textColor;
  wrapText(subheadline, width / 2, baseY + 110, width * 0.75, 34);

  ctx.font = "20px Inter";
  wrapText(mensagem, width / 2, baseY + 180, width * 0.7, 28);

  // Logotipo
  try {
    const logo = await carregarImagem(logos[color]);
    const logoWidth = 200;
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
  try {
    createLoader();
    const themeInput = document.getElementById("themeInput").value.trim();
    const tema = themeInput || "Marketing MEI";

    const conteudo = buscarConteudoPorTema(tema);
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

    // imagem nova apenas ao gerar tema
    const imageUrl = await getUnsplashImage(conteudo.tema);
    lastImageDataUrl = imageUrl;

    await drawPost({ ...conteudo, format: currentFormat, color });
  } catch (error) {
    alert("Erro ao gerar post: " + error.message);
    console.error(error);
  } finally {
    removeLoader();
  }
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
    if (lastContent && lastImageDataUrl) {
      drawPost({ ...lastContent, format: currentFormat, color: corFinal });
    }
  });
});

document.querySelectorAll(".dimension-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    currentFormat = btn.dataset.format;
    const corFinal = lastColor || getRandomColor();
    if (lastContent && lastImageDataUrl) {
      drawPost({ ...lastContent, format: currentFormat, color: corFinal });
    }
  });
});

function createLoader() {
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.innerHTML = `<span style="display:inline-block;width:16px;height:16px;border:3px solid #fff;border-top:3px solid transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></span> Gerando post...`;
  Object.assign(loader.style, {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "20px 30px",
    background: "#1e1e1e",
    color: "#fff",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 9999,
    borderRadius: "8px",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
    fontSize: "16px"
  });
  document.body.appendChild(loader);
}

function removeLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.remove();
}

function getRandomColor() {
  const keys = Object.keys(colors);
  return keys[Math.floor(Math.random() * keys.length)];
}

function random(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// buscarConteudoPorTema e gerarVariaçãoDeTema você já tem ✅
