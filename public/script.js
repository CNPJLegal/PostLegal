async function drawPost({ tema, headline, subheadline, mensagem, legenda, tags, format, color }) {
  const { width, height, topOffset } = formats[format];
  canvas.width = width;
  canvas.height = height;

  ctx.globalAlpha = 1;
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
  } catch (e) {
    console.warn("Erro ao carregar imagem:", e);
  }

  // Overlay decorativo
  try {
    const overlay = await carregarImagem("https://iili.io/FrLiI5P.png");
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(overlay, 0, 0, width, height);
    ctx.drawImage(overlay, 0, 0, width, height);
    ctx.restore();
  } catch (e) {
    console.warn("Erro ao carregar overlay:", e);
  }

  // Elementos visuais +++++ e seta 📐
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

    ctx.drawImage(topRight, width - topRight.width - 60, 40);
    ctx.drawImage(bottomLeft, 40, height - bottomLeft.height - 50);
  } catch (e) {
    console.warn("Erro ao carregar decorativos:", e);
  }

  // Posicionamento de textos 📝
  const spacingY = format === "quadrado" ? 60 : 100;
  const textStartY = imageBottomY + spacingY;
  ctx.textAlign = "center";
  const textColor = (color === "branco" || color === "verde") ? "#000" : "#fff";

  // Headline
  ctx.font = "bold 46px Inter";
  ctx.fillStyle = color === "verde" ? "#000" : color === "branco" ? "#0f3efa" : "#17e30d";
  wrapText(headline, width / 2, textStartY, width * 0.85, 50);

  // Subheadline
  ctx.font = "28px Inter";
  ctx.fillStyle = textColor;
  wrapText(subheadline, width / 2, textStartY + 110, width * 0.75, 34);

  // Mensagem
  ctx.font = "20px Inter";
  wrapText(mensagem, width / 2, textStartY + 180, width * 0.7, 28);

  // Logotipo corrigido 📌
  try {
    const logo = await carregarImagem(logos[color]);
    const logoWidth = 220;
    const logoHeight = logo.height * (logoWidth / logo.width);
    ctx.drawImage(logo, (width - logoWidth) / 2, height - logoHeight - 40);
  } catch (e) {
    console.warn("Erro ao carregar logo:", e);
  }

  // Legenda e tags
  document.getElementById("postInfo").style.display = "block";
  document.getElementById("caption").innerText = legenda;
  document.getElementById("tags").innerText = tags;
}

async function drawPost({ tema, headline, subheadline, mensagem, legenda, tags, format, color }) {
  const { width, height, topOffset } = formats[format];
  canvas.width = width;
  canvas.height = height;

  ctx.globalAlpha = 1;
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
  } catch (e) {
    console.warn("Erro ao carregar imagem:", e);
  }

  // Overlay decorativo
  try {
    const overlay = await carregarImagem("https://iili.io/FrLiI5P.png");
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(overlay, 0, 0, width, height);
    ctx.drawImage(overlay, 0, 0, width, height);
    ctx.restore();
  } catch (e) {
    console.warn("Erro ao carregar overlay:", e);
  }

  // Decorações (+++++ e setas)
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

    ctx.drawImage(topRight, width - topRight.width - 60, 50); // Ajustado mais pra direita e topo
    ctx.drawImage(bottomLeft, 50, height - bottomLeft.height - 60); // Ajustado mais pra baixo
  } catch (e) {
    console.warn("Erro ao carregar decorativos:", e);
  }

  // 🔡 POSICIONAMENTO DOS TEXTOS
  const spacingY = (format === "post" || format === "quadrado") ? 80 : 110;
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

  // 🖼️ Logotipo centralizado corretamente
  try {
    const logo = await carregarImagem(logos[color]);
    const logoWidth = 210;
    const logoHeight = logo.height * (logoWidth / logo.width);
    ctx.drawImage(logo, (width - logoWidth) / 2, height - logoHeight - 40);
  } catch (e) {
    console.warn("Erro ao carregar logo:", e);
  }

  // Legenda e tags exibidas abaixo do canvas
  document.getElementById("postInfo").style.display = "block";
  document.getElementById("caption").innerText = legenda;
  document.getElementById("tags").innerText = tags;
}
