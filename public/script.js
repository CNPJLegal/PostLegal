// 👉 Começo do Código
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
  let lines = [], line = "";
  for (let word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      lines.push(line.trim());
      line = word + " ";
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

const posts = [/* ... posts como no seu exemplo ... */];

function gerarVariaçãoDeTema(temaBase) {
  const headlines = [/* ... */];
  const subheadlines = [/* ... */];
  const mensagens = [/* ... */];
  const legendas = [/* ... */];
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
  return match ? {
    tema: match.Tema,
    headline: match.Headline,
    subheadline: match.Subheadline,
    mensagem: match.CTA,
    legenda: match.Legenda,
    tags: match.Tags
  } : gerarVariaçãoDeTema(tema);
}

async function getUnsplashImage(query) {
  const res = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!data.url) throw new Error(data.error || "Erro ao obter imagem da API.");
  return data.url;
}

async function drawPost({ tema, headline, subheadline, mensagem, legenda, tags, format, color }) {
  const { width, height, topOffset } = formats[format];
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  let imageBottomY = 0;
  try {
    if (!cachedImage) {
      const imageUrl = await getUnsplashImage(tema);
      cachedImage = await carregarImagem(imageUrl);
    }

    const img = cachedImage;
    const imageWidth = 835;
    let imageHeight = (img.height / img.width) * imageWidth;
    if (format === "quadrado") imageHeight *= 0.85;

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
  } catch (e) { console.warn("Erro ao carregar imagem:", e); }

  // 🎯 Overlay
  try {
    const overlay = await carregarImagem("https://iili.io/FrLiI5P.png");
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(overlay, 0, 0, width, height);
    ctx.restore();
  } catch (e) { console.warn("Erro overlay:", e); }

  // 🎯 Decorativos
  try {
    const elements = {
      azul: { topRight: "https://iili.io/FPeHOiP.png", bottomLeft: "https://iili.io/FPe2AHg.png" },
      preto: { topRight: "https://iili.io/FPeHOiP.png", bottomLeft: "https://iili.io/FPe2AHg.png" },
      verde: { topRight: "https://iili.io/FPeFE9n.png", bottomLeft: "https://iili.io/FPeKPzG.png" },
      branco: { topRight: "https://iili.io/FPeFE9n.png", bottomLeft: "https://iili.io/FPeKPzG.png" }
    };
    const deco = elements[color];
    const topRight = await carregarImagem(deco.topRight);
    const bottomLeft = await carregarImagem(deco.bottomLeft);

    ctx.drawImage(topRight, width - 60 - topRight.width, 90);
    const bottomYOffset = format === "quadrado" ? 80 : 143;
    ctx.drawImage(bottomLeft, 30, height - bottomYOffset - bottomLeft.height);
  } catch (e) { console.warn("Erro decorativos:", e); }

  const spacingY = format === "quadrado" ? 60 : format === "post" ? 90 : 120;
  const textStartY = imageBottomY + spacingY;
  const textColor = (color === "branco" || color === "verde") ? "#000" : "#fff";

  ctx.textAlign = "center";
  ctx.font = "bold 46px Inter";
  ctx.fillStyle = (color === "verde") ? "#000" : (color === "branco") ? "#0f3efa" : "#17e30d";
  wrapText(headline, width / 2, textStartY, width * 0.85, 50);

  ctx.font = "28px Inter";
  ctx.fillStyle = textColor;
  wrapText(subheadline, width / 2, textStartY + 110, width * 0.75, 34);

  ctx.font = "20px Inter";
  wrapText(mensagem, width / 2, textStartY + 180, width * 0.7, 28);

  try {
    const logo = await carregarImagem(logos[color]);
    const logoWidth = 200;
    const logoHeight = logo.height * (logoWidth / logo.width);
    ctx.drawImage(logo, (width - logoWidth) / 2, height - logoHeight - 40);
  } catch (e) {
    console.warn("Erro ao carregar logo:", e);
  }

  document.getElementById("postInfo").style.display = "block";
  document.getElementById("caption").innerText = legenda;
  document.getElementById("tags").innerText = tags;
}

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

document.getElementById("generateBtn").addEventListener("click", async () => {
  try {
    createLoader();
    const themeInput = document.getElementById("themeInput").value.trim();
    const conteudo = buscarConteudoPorTema(themeInput || random(posts).Tema);
    lastContent = conteudo;
    cachedImage = null;

    const selectedColorBtn = document.querySelector(".color-btn.selected");
    const userColorChoice = selectedColorBtn?.dataset?.color;
    const color = !userColorChoice || userColorChoice === "aleatoria" ? getRandomColor() : userColorChoice;

    if (userColorChoice === "aleatoria") {
      document.querySelectorAll(".color-btn").forEach(b => b.classList.toggle("selected", b.dataset.color === "aleatoria"));
    }

    lastColor = color;
    await drawPost({ ...conteudo, format: currentFormat, color });
  } catch (error) {
    alert("Erro ao gerar post: " + error.message);
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

document.getElementById("changeImageBtn")?.addEventListener("click", async () => {
  try {
    document.getElementById("changeImageBtn").style.borderRadius = "999px";
    createLoader();
    cachedImage = null;
    if (lastContent && lastColor) {
      await drawPost({ ...lastContent, format: currentFormat, color: lastColor });
    }
  } catch (e) {
    alert("Erro ao trocar imagem: " + e.message);
  } finally {
    removeLoader();
  }
});
