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

const posts = [
  {
    Tema: "O que é desenquadramento do MEI",
    Headline: "O que é desenquadramento do MEI: o que todo MEI precisa saber.",
    Subheadline: "Talvez você nunca tenha ouvido falar disso, mas é um dos pontos mais decisivos para manter o CNPJ vivo.",
    CTA: "Receba seu diagnóstico gratuito em menos de 2 minutos.",
    Legenda: "Sabe quando tudo parece certo, mas o sistema trava? Muitas vezes o motivo é esse aqui — simples, silencioso e ignorado.",
    Tags: "#NegócioSeguro #ConsultoriaMEI #RotinaEmpreendedora #DescomplicaMEI #CNPJPronto"
  },
  {
    Tema: "Como emitir nota fiscal pelo celular",
    Headline: "Como emitir nota fiscal pelo celular: o que todo MEI precisa saber.",
    Subheadline: "Muitos ignoram esse detalhe e acabam travando o crescimento por uma questão simples de ajuste.",
    CTA: "Fale com um especialista da CNPJ Legal agora mesmo.",
    Legenda: "Tem empreendedor com anos de experiência ainda errando nesse detalhe. Não seja mais um.",
    Tags: "#NotaFiscalSimples #MEIMobile #CNPJNaMão #RotinaEmpreendedora #EmissaoDigital"
  },
  {
    Tema: "Passo a passo para abrir um MEI",
    Headline: "Passo a passo para abrir um MEI: tudo o que você precisa saber.",
    Subheadline: "Desde o cadastro até o primeiro imposto, veja como se formalizar sem sair de casa.",
    CTA: "Comece agora mesmo e tenha apoio da CNPJ Legal.",
    Legenda: "Abrir um MEI é mais simples do que parece. Só precisa seguir os passos certos — e evitar as armadilhas.",
    Tags: "#MEIAberto #FormalizaçãoJá #CNPJLegal #PrimeiroPasso #EmpreendedorismoSimples"
  }
];

function gerarVariaçãoDeTema(temaBase) {
  const headlines = [
    `Tudo sobre ${temaBase} que ninguém te contou.`,
    `${temaBase}: entenda como aplicar na sua rotina.`,
    `${temaBase}: o que você precisa saber agora.`,
    `${temaBase} explicado de forma simples.`,
    `${temaBase} pode mudar seu negócio.`
  ];
  const subheadlines = [
    "Descubra como isso impacta diretamente seu sucesso.",
    "Entenda por que isso é crucial no seu dia a dia.",
    "Evite os erros mais comuns com esse conhecimento.",
    "Dê o primeiro passo com clareza e confiança.",
    "Veja o que os especialistas recomendam sobre o tema."
  ];
  const mensagens = [
    "Acesse agora e tenha um diagnóstico gratuito.",
    "Conte com a CNPJ Legal para te ajudar.",
    "Fale com um especialista em menos de 2 minutos.",
    "Tire suas dúvidas com quem entende.",
    "Descubra tudo com um clique."
  ];
  const legendas = [
    "Este conteúdo foi gerado com base no seu tema. Legal, né?",
    "Um bom tema rende bons insights. Aqui está o seu.",
    "Seu post foi criado automaticamente. Experimente outros!",
    "Quer ver mais? Troque o tema e gere de novo.",
    "Cada clique, uma ideia. Aqui está mais uma!"
  ];
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
  if (match) {
    return {
      tema: match.Tema,
      headline: match.Headline,
      subheadline: match.Subheadline,
      mensagem: match.CTA,
      legenda: match.Legenda,
      tags: match.Tags
    };
  }
  return gerarVariaçãoDeTema(tema);
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

async function drawPost({ tema, headline, subheadline, mensagem, legenda, tags, format, color }) {
  const { width, height, topOffset } = formats[format];
  canvas.width = width;
  canvas.height = height;

  ctx.globalAlpha = 1;
  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  // Imagem principal
  let imageBottomY = 0;
  try {
    if (!cachedImage) {
      const imageUrl = await getUnsplashImage(tema);
      cachedImage = await carregarImagem(imageUrl);
    }
    const img = cachedImage;
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

    // Overlays com efeito multiplicação
    const overlay = await carregarImagem("https://iili.io/FrLiI5P.png");
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(overlay, 0, 0, width, height);
    ctx.drawImage(overlay, 0, 0, width, height);
    ctx.restore();

  } catch (e) {
    console.warn("Erro ao carregar imagem:", e);
  }

  // Elementos decorativos
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

    const bottomLeftYOffset = format === "quadrado" ? 80 : 0;
    ctx.drawImage(
      bottomLeft,
      27,
      height - 143 - bottomLeft.height + bottomLeftYOffset,
      bottomLeft.width,
      bottomLeft.height
    );
  } catch (e) {
    console.warn("Erro ao carregar elementos decorativos:", e);
  }

  // Textos
  const spacingY = (format === "post" || format === "quadrado") ? 60 : 40;
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

function getRandomColor() {
  const keys = Object.keys(colors);
  return keys[Math.floor(Math.random() * keys.length)];
}

function random(array) {
  return array[Math.floor(Math.random() * array.length)];
}
