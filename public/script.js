const canvas = document.getElementById("postCanvas");
const ctx = canvas.getContext("2d");
const themeInput = document.getElementById("themeInput");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const captionDiv = document.getElementById("caption");
const tagsDiv = document.getElementById("tags");
const colorButtons = document.querySelectorAll(".color-btn");
const dimensionButtons = document.querySelectorAll(".dimension-btn");

let selectedColor = "aleatoria";
let selectedFormat = "post";
let currentImage = null;
let currentTema = "";
let currentPost = null;

const formats = {
  quadrado: { width: 1080, height: 1080 },
  post: { width: 1080, height: 1350 },
  stories: { width: 1080, height: 1720 },
};

const colors = {
  azul: "#0057FF",
  verde: "#00D14F",
  preto: "#000000",
  branco: "#FFFFFF",
};

const graphics = {
  azul: {
    topRight: "https://iili.io/FPeHOiP.png",
    bottomLeft: "https://iili.io/FPe2AHg.png",
  },
  preto: {
    topRight: "https://iili.io/FPeHOiP.png",
    bottomLeft: "https://iili.io/FPe2AHg.png",
  },
  verde: {
    topRight: "https://iili.io/FPeFE9n.png",
    bottomLeft: "https://iili.io/FPeKPzG.png",
  },
  branco: {
    topRight: "https://iili.io/FPeFE9n.png",
    bottomLeft: "https://iili.io/FPeKPzG.png",
  },
};

const posts = [
  {
    tema: "nota fiscal",
    titulo: "Como emitir nota fiscal pelo celular: o que todo MEI precisa saber.",
    texto: "Muitos ignoram esse detalhe e acabam travando o crescimento por uma questão simples de ajuste.",
    legenda: "Tem empreendedor com anos de experiência ainda errando nesse detalhe. Não seja mais um.",
    tags: ["#NotaFiscalSimples", "#MEIMobile", "#CNPJNaMão", "#RotinaEmpreendedora", "#EmissaoDigital"]
  },
  {
    tema: "marketing",
    titulo: "Tudo sobre Marketing MEI que ninguém te contou.",
    texto: "Evite os erros mais comuns com esse conhecimento.",
    legenda: "Um bom tema rende bons insights. Aqui está o seu.",
    tags: ["#CNPJLegal", "#MarketingMEI", "#EmpreenderComSegurança", "#PostInteligente", "#AutomaçãoCriativa"]
  }
];

function getRandomColor() {
  const keys = Object.keys(colors);
  return colors[keys[Math.floor(Math.random() * keys.length)]];
}

function buscarConteudoPorTema(tema) {
  if (!tema) return posts[Math.floor(Math.random() * posts.length)];
  return posts.find(p => p.tema.toLowerCase().includes(tema.toLowerCase())) || posts[0];
}

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = url;
  });
}

async function gerarPost() {
  generateBtn.textContent = "Gerando...";
  generateBtn.disabled = true;

  const tema = themeInput.value.trim();
  const format = formats[selectedFormat];
  canvas.width = format.width;
  canvas.height = format.height;

  const corBase = selectedColor === "aleatoria" ? getRandomColor() : colors[selectedColor];
  ctx.fillStyle = corBase;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  currentPost = buscarConteudoPorTema(tema);

  if (!currentImage || tema !== currentTema) {
    currentTema = tema;
    const res = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(currentPost.tema)}&orientation=portrait&client_id=${window.UNSPLASH_ACCESS_KEY}`);
    const data = await res.json();
    currentImage = await loadImage(data.urls.regular);
  }

  const imgW = 835;
  const scale = imgW / currentImage.width;
  const imgH = currentImage.height * scale;
  const imgX = (canvas.width - imgW) / 2;
  const imgY = selectedFormat === "post" ? 80 : selectedFormat === "quadrado" ? 70 : 60;

  // imagem do post
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(imgX, imgY, imgW, imgH, 50);
  ctx.clip();
  ctx.drawImage(currentImage, imgX, imgY, imgW, imgH);
  ctx.restore();

  // elementos gráficos (após imagem!)
  const corChave = selectedColor === "aleatoria" ? "azul" : selectedColor;
  const elementos = graphics[corChave];

  const topRight = await loadImage(elementos.topRight);
  const bottomLeft = await loadImage(elementos.bottomLeft);

  const topX = canvas.width - topRight.width - 85;
  const topY = 93;
  ctx.drawImage(topRight, topX, topY);

  let bottomY = canvas.height - 143;
  if (selectedFormat === "quadrado") bottomY += 20;
  ctx.drawImage(bottomLeft, 27, bottomY);

  // textos
  const headlineColor = corChave === "branco" ? "#000" : corChave === "preto" ? "#fff" : corChave;

  ctx.fillStyle = headlineColor;
  ctx.font = "bold 40px Inter";
  ctx.textAlign = "center";
  ctx.fillText(currentPost.titulo, canvas.width / 2, imgY + imgH + 80);

  ctx.fillStyle = "#000";
  ctx.font = "24px Inter";
  ctx.fillText(currentPost.texto, canvas.width / 2, imgY + imgH + 130);

  ctx.font = "18px Inter";
  ctx.fillText("Fale com um especialista da CNPJ Legal agora mesmo.", canvas.width / 2, imgY + imgH + 170);

  captionDiv.innerText = currentPost.legenda;
  tagsDiv.innerText = currentPost.tags.join(" ");
  document.getElementById("postInfo").style.display = "block";

  generateBtn.textContent = "Gerar";
  generateBtn.disabled = false;
}

generateBtn.addEventListener("click", gerarPost);

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "post-cnpj-legal.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

colorButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    colorButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedColor = btn.dataset.color;
  });
});

dimensionButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    dimensionButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedFormat = btn.dataset.format;
  });
});
