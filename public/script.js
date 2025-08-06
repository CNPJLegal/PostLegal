const canvas = document.getElementById("postCanvas");
const ctx = canvas.getContext("2d");

const colors = {
  azul: "#0f3efa",
  verde: "#17e30d",
  preto: "#1c1c1c",
  branco: "#ffffff",
};

const logos = {
  azul: "https://iili.io/Frik9yl.png",
  preto: "https://iili.io/Frik9yl.png",
  branco: "https://iili.io/Fri8NTl.png",
  verde: "https://iili.io/FryqWHG.png",
};

const formats = {
  quadrado: { width: 1080, height: 1080, topOffset: 100, arrowOffset: 110 },
  post: { width: 1080, height: 1350, topOffset: 185, arrowOffset: 143 },
  stories: { width: 1080, height: 1720, topOffset: 236, arrowOffset: 143 },
};

let currentFormat = "post";
let lastColor = null;
let lastContent = null;
let lastImageURL = null;
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

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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
  return data.url;
}

function getRandomColor() {
  const keys = Object.keys(colors);
  return keys[Math.floor(Math.random() * keys.length)];
}

async function drawPost({ tema, headline, subheadline, mensagem, legenda, tags, format, color }) {
  const { width, height, topOffset, arrowOffset } = formats[format];
  canvas.width = width;
  canvas.height = height;

  // fundo sólido
  ctx.globalAlpha = 1;
  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  // camada de efeito multiplicação aplicada duas vezes
  for (let i = 0; i < 2; i++) {
    try {
      const overlay = await carregarImagem("https://iili.io/FrLiI5P.png");
      ctx.globalAlpha = 0.35;
      ctx.drawImage(overlay, 0, 0, width, height);
    } catch (e) {
      console.warn("Erro ao carregar overlay:", e);
    }
  }

  // elementos gráficos adicionais
  try {
    const isLight = color === "branco" || color === "verde";

    const plus = await carregarImagem(isLight
      ? "https://iili.io/FPeFE9n.png"
      : "https://iili.io/FPeHOiP.png");

    const arrow = await carregarImagem(isLight
      ? "https://iili.io/FPeKPzG.png"
      : "https://iili.io/FPe2AHg.png");

    const plusW = plus.width;
    const plusH = plus.height;
    ctx.drawImage(plus, width - plusW - 85, 93, plusW, plusH);

    const arrowW = arrow.width;
    const arrowH = arrow.height;
    const extraArrowOffset = format === "quadrado" ? 20 : 0;
    ctx.drawImage(arrow, 27, height - arrowOffset - arrowH + extraArrowOffset, arrowW, arrowH);
  } catch (e) {
    console.warn("Erro ao carregar elementos visuais:", e);
  }

  // imagem principal
  let imageBottomY = 0;
  try {
    const img = await carregarImagem(lastImageURL);
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
    console.warn("Erro ao carregar imagem:", e);
  }

  // textos
  const textStartY = imageBottomY + (format === "post" || format === "quadrado" ? 60 : 40);
  ctx.textAlign = "center";
  const textColor = color === "verde" || color === "branco" ? "#000" : "#fff";
  const headlineColor = color === "verde" ? "#000" : color === "branco" ? "#0f3efa" : "#17e30d";

  ctx.font = "bold 46px Inter";
  ctx.fillStyle = headlineColor;
  wrapText(headline, width / 2, textStartY, width * 0.85, 50);

  ctx.font = "28px Inter";
  ctx.fillStyle = textColor;
  wrapText(subheadline, width / 2, textStartY + 110, width * 0.75, 34);

  ctx.font = "20px Inter";
  wrapText(mensagem, width / 2, textStartY + 180, width * 0.7, 28);

  // logo
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

function buscarConteudoPorTema(tema) {
  const match = posts.find((p) => p.Tema.toLowerCase().includes(tema.toLowerCase()));
  if (match) {
    return {
      tema: match.Tema,
      headline: match.Headline,
      subheadline: match.Subheadline,
      mensagem: match.CTA,
      legenda: match.Legenda,
      tags: match.Tags,
    };
  }
  return gerarVariaçãoDeTema(tema);
}

document.getElementById("generateBtn").addEventListener("click", async () => {
  try {
    createLoader();
    const themeInput = document.getElementById("themeInput").value.trim();
    const conteudo = buscarConteudoPorTema(themeInput || random(posts).Tema);
    lastContent = conteudo;

    const selectedColorBtn = document.querySelector(".color-btn.selected");
    const userColorChoice = selectedColorBtn?.dataset?.color;
    const color = !userColorChoice || userColorChoice === "aleatoria"
      ? getRandomColor()
      : userColorChoice;

    lastColor = color;
    lastImageURL = await getUnsplashImage(conteudo.tema);

    await drawPost({ ...conteudo, format: currentFormat, color });
  } catch (e) {
    alert("Erro ao gerar post: " + e.message);
    console.error(e);
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

document.querySelectorAll(".color-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".color-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    lastColor = btn.dataset.color === "aleatoria" ? null : btn.dataset.color;
    const corFinal = lastColor || getRandomColor();
    if (lastContent && lastImageURL) {
      drawPost({ ...lastContent, format: currentFormat, color: corFinal });
    }
  });
});

document.querySelectorAll(".dimension-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dimension-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    currentFormat = btn.dataset.format;
    const corFinal = lastColor || getRandomColor();
    if (lastContent && lastImageURL) {
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
