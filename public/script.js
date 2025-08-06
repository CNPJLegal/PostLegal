// 👉 Começo do Código Atualizado
const canvas = document.getElementById("postCanvas");
const ctx = canvas.getContext("2d");

// ... [cores, logos, formatos, funções wrapText, applyZoom etc.] (sem alterações)

// ⚠️ MANTEMOS O BLOCO `const posts = [...]` COMO NO CÓDIGO ANTERIOR
// Para foco nas alterações pedidas

async function drawPost({ tema, headline, subheadline, mensagem, legenda, tags, format, color }) {
  const { width, height, topOffset } = formats[format];
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  let imageBottomY = 0;

  // 🔼 Imagem principal
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

  // ✅ DECORATIVOS ANTES DO OVERLAY
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
  } catch (e) {
    console.warn("Erro decorativos:", e);
  }

  // ✅ SOBREPOSIÇÃO DE PAPEL AMASSADO APÓS DECORATIVOS
  try {
    const overlay = await carregarImagem("https://iili.io/FrLiI5P.png");
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(overlay, 0, 0, width, height);
    ctx.restore();
  } catch (e) {
    console.warn("Erro overlay:", e);
  }

  // ✅ TEXTOS
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

  // ✅ NOVA POSIÇÃO E TAMANHO DO LOGOTIPO
  try {
    const logo = await carregarImagem(logos[color]);
    const logoWidth = 140; // reduzido
    const logoHeight = logo.height * (logoWidth / logo.width);
    const marginBottom = 40;
    const logoX = (width - logoWidth) / 2;
    const logoY = height - logoHeight - marginBottom;
    ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
  } catch (e) {
    console.warn("Erro ao carregar logo:", e);
  }

  document.getElementById("postInfo").style.display = "block";
  document.getElementById("caption").innerText = legenda;
  document.getElementById("tags").innerText = tags;
}
