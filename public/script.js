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

  ctx.globalAlpha = 1;
  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  // Elementos gráficos de seta e "+" (ANTES DO OVERLAY DE PAPEL)
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
    console.warn("Erro ao carregar elementos decorativos:", e);
  }

  // Textura de papel amassado (após gráfico)
  try {
    const overlay = await carregarImagem("https://iili.io/FrLiI5P.png");
    for (let i = 0; i < 2; i++) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(overlay, 0, 0, width, height);
      ctx.restore();
    }
  } catch (e) {
    console.warn("Erro ao carregar overlay:", e);
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
    const imageHeight = format === "quadrado"
      ? (img.height / img.width) * imageWidth * 0.85
      : (img.height / img.width) * imageWidth;
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

  // Textos
  const spacingY = (format === "post") ? 100 : (format === "stories") ? 120 : 60;
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
    console.warn("Erro ao carregar logo:", e);
  }

  document.getElementById("postInfo").style.display = "block";
  document.getElementById("caption").innerText = legenda;
  document.getElementById("tags").innerText = tags;
}

// BOTÕES E EVENTOS
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

    if (userColorChoice === "aleatoria") {
      document.querySelectorAll(".color-btn").forEach(b => {
        b.classList.toggle("selected", b.dataset.color === "aleatoria");
      });
    }

    lastColor = color;
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
