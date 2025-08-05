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
  quadrado: { width: 1080, height: 1080 },
  post: { width: 1080, height: 1350 },
  stories: { width: 1080, height: 1720 }
};

let currentFormat = "post";
let lastColor = null;
let lastContent = null;
let lastImageUrl = null;
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

const posts = [/* ... seus posts, mantidos como já estavam ... */];

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

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}

async function buscarImagemUnsplash(tema) {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || window.UNSPLASH_ACCESS_KEY;
  const query = encodeURIComponent(tema);
  const url = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${accessKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const imageUrl = data.urls.regular;

    if (imageUrl !== lastImageUrl) {
      lastImageUrl = imageUrl;
      return imageUrl;
    }

    return await buscarImagemUnsplash(tema + " detalhe");
  } catch (e) {
    console.warn("Erro buscando imagem:", e);
    return null;
  }
}

async function drawPost({ tema, headline, subheadline, mensagem, legenda, tags, format, color }) {
  const { width, height } = formats[format];
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  const imagemUrl = await buscarImagemUnsplash(tema);
  if (imagemUrl) {
    try {
      const img = await carregarImagem(imagemUrl);
      const radius = 120;
      const imgHeight = height * 0.4;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(width - radius, 0);
      ctx.quadraticCurveTo(width, 0, width, radius);
      ctx.lineTo(width, imgHeight - radius);
      ctx.quadraticCurveTo(width, imgHeight, width - radius, imgHeight);
      ctx.lineTo(radius, imgHeight);
      ctx.quadraticCurveTo(0, imgHeight, 0, imgHeight - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, width, imgHeight);
      ctx.restore();
    } catch (e) {
      console.warn("Erro ao carregar imagem do tema:", e);
    }
  }

  ctx.textAlign = "center";
  ctx.font = "bold 46px Inter";
  ctx.fillStyle = (color === "verde") ? "#000" : (color === "branco") ? "#0f3efa" : "#17e30d";
  wrapText(headline, width / 2, height / 2 - 200, width * 0.85, 50);

  let textColor = (color === "branco" || color === "verde") ? "#000" : "#fff";

  ctx.font = "28px Inter";
  ctx.fillStyle = textColor;
  wrapText(subheadline, width / 2, height / 2 - 80, width * 0.75, 34);

  ctx.font = "20px Inter";
  wrapText(mensagem, width / 2, height / 2 + 20, width * 0.7, 28);

  try {
    const logo = await carregarImagem(logos[color]);
    const logoWidth = 140;
    const logoHeight = logo.height * (logoWidth / logo.width);
    ctx.drawImage(logo, (width - logoWidth) / 2, height - logoHeight - 50, logoWidth, logoHeight);
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
    display: "flex", alignItems: "center", gap: "10px", padding: "20px 30px",
    background: "#1e1e1e", color: "#fff", position: "fixed", top: "50%",
    left: "50%", transform: "translate(-50%, -50%)", zIndex: 9999,
    borderRadius: "8px", boxShadow: "0 0 20px rgba(0,0,0,0.4)", fontSize: "16px"
  });
  document.body.appendChild(loader);
}
function removeLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.remove();
}

document.getElementById("generateBtn").addEventListener("click", async () => {
  createLoader();

  const themeInput = document.getElementById("themeInput").value.trim();
  const conteudo = buscarConteudoPorTema(themeInput || random(posts).Tema);
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
  await drawPost({ ...conteudo, format: currentFormat, color });

  removeLoader();
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

function getRandomColor() {
  const keys = Object.keys(colors);
  return keys[Math.floor(Math.random() * keys.length)];
}
