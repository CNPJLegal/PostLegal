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
  quadrado: { width: 1080, height: 1080, topOffset: 120, imageMaxHeight: 300 },
  post: { width: 1080, height: 1350, topOffset: 120, imageMaxHeight: 450 },
  stories: { width: 1080, height: 1720, topOffset: 236, imageMaxHeight: 500 }
};

let currentFormat = "post";
let lastColor = null;
let lastContent = null;
let zoomLevel = 0.45;
let cachedImage = null;
let currentImageUrl = null;

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

function random(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomColor() {
  const keys = Object.keys(colors);
  return keys[Math.floor(Math.random() * keys.length)];
}

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
  currentImageUrl = data.url;
  return data.url;
}

async function drawPost({ tema, headline, subheadline, mensagem, legenda, tags, format, color }) {
  const { width, height, topOffset, imageMaxHeight } = formats[format];
  canvas.width = width;
  canvas.height = height;

  ctx.globalAlpha = 1;
  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  // Elementos decorativos (camada inicial)
  try {
    const elements = {
      azul: {
        topRight: "https://iili.io/FPeHOiP.png",
        bottomLeft: "https://iili.io/FPe2AHg.png"
      },
      preto: {
        topRight: "https://iili.io/FPeHOiP.png",
        bottomLeft: "https://iili.io/FPe2AHg.png"
      },
      verde: {
        topRight: "https://iili.io/FPeFE9n.png",
        bottomLeft: "https://iili.io/FPeKPzG.png"
      },
      branco: {
        topRight: "https://iili.io/FPeFE9n.png",
        bottomLeft: "https://iili.io/FPeKPzG.png"
      }
    };
    const deco = elements[color];
    const topRight = await carregarImagem(deco.topRight);
    const bottomLeft = await carregarImagem(deco.bottomLeft);
    ctx.drawImage(topRight, width - 85 - topRight.width, 93, topRight.width, topRight.height);
    ctx.drawImage(bottomLeft, 27, height - 143 - bottomLeft.height, bottomLeft.width, bottomLeft.height);
  } catch (e) {
    console.warn("Erro decorativos:", e);
  }

  // Imagem principal
  let imageBottomY = 0;
  try {
    if (!cachedImage) {
      const imageUrl = await getUnsplashImage(tema);
      cachedImage = await carregarImagem(imageUrl);
    }
    const img = cachedImage;
    const imageWidth = 835;
    const imgHeight = (img.height / img.width) * imageWidth;
    const imageHeight = Math.min(imgHeight, imageMaxHeight);
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
    console.warn("Erro imagem principal:", e);
  }

  // Camada overlay (dupla)
  try {
    const overlay = await carregarImagem("https://iili.io/FrLiI5P.png");
    for (let i = 0; i < 2; i++) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.drawImage(overlay, 0, 0, width, height);
      ctx.restore();
    }
  } catch (e) {
    console.warn("Erro overlay:", e);
  }

  // Textos
  let spacingY = (format === "post") ? 100 : (format === "stories") ? 120 : 60;
  const textStartY = imageBottomY + spacingY;

  ctx.textAlign = "center";
  const textColor = (color === "branco" || color === "verde") ? "#000" : "#fff";

  ctx.font = "bold 46px Inter";
  ctx.fillStyle = (color === "verde") ? "#000" : (color === "branco") ? "#0f3efa" : "#17e30d";
  wrapText(headline, width / 2, textStartY, width * 0.85, 50);

  ctx.font = "28px Inter";
  ctx.fillStyle = textColor;
  wrapText(subheadline, width / 2, textStartY + 110, width * 0.75, 34);

  ctx.font = "20px Inter";
  wrapText(mensagem, width / 2, textStartY + 180, width * 0.7, 28);

  // Logo
  try {
    const logo = await carregarImagem(logos[color]);
    const logoWidth = 200;
    const logoHeight = logo.height * (logoWidth / logo.width);
    ctx.drawImage(logo, (width - logoWidth) / 2, height - logoHeight - 50, logoWidth, logoHeight);
  } catch (e) {
    console.warn("Erro logo:", e);
  }

  document.getElementById("postInfo").style.display = "block";
  document.getElementById("caption").innerText = legenda;
  document.getElementById("tags").innerText = tags;
}

// Botões
document.getElementById("generateBtn").addEventListener("click", async () => {
  try {
    createLoader();
    const themeInput = document.getElementById("themeInput").value.trim();
    const conteudo = buscarConteudoPorTema(themeInput || random(posts).Tema);
    lastContent = conteudo;
    cachedImage = null;
    const selectedColorBtn = document.querySelector(".color-btn.selected");
    const userColorChoice = selectedColorBtn?.dataset?.color;
    const color = !userColorChoice || userColorChoice === "aleatoria"
      ? getRandomColor()
      : userColorChoice;

    lastColor = color;
    await drawPost({ ...conteudo, format: currentFormat, color });
  } catch (e) {
    alert("Erro ao gerar post: " + e.message);
  } finally {
    removeLoader();
  }
});

document.getElementById("changeImageBtn").addEventListener("click", async () => {
  try {
    createLoader();
    cachedImage = null;
    await drawPost({ ...lastContent, format: currentFormat, color: lastColor });
  } catch (e) {
    alert("Erro ao mudar imagem: " + e.message);
  } finally {
    removeLoader();
  }
});

// Download
document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "post-cnpj-legal.png";
  link.href = canvas.toDataURL();
  link.click();
});

// Dimensões
document.querySelectorAll(".dimension-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    currentFormat = btn.dataset.format;
    if (lastContent) drawPost({ ...lastContent, format: currentFormat, color: lastColor });
  });
});

// Loader
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
