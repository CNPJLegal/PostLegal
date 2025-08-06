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

function selectPost(tema) {
  if (!tema) return posts[Math.floor(Math.random() * posts.length)];
  const found = posts.find(p => p.tema.toLowerCase().includes(tema.toLowerCase()));
  return found || posts[0];
}

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = url;
  });
}

async function generatePost() {
  generateBtn.disabled = true;

  const tema = themeInput.value.trim();
  const format = formats[selectedFormat];
  canvas.width = format.width;
  canvas.height = format.height;

  currentPost = selectPost(tema);

  const bgColor = selectedColor === "aleatoria" ? getRandomColor() : colors[selectedColor];
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // fetch image once per theme only
  if (!currentImage || tema !== currentPost.tema) {
    const query = encodeURIComponent(currentPost.tema);
    const res = await fetch(`https://api.unsplash.com/photos/random?query=${query}&orientation=portrait&client_id=${window.UNSPLASH_ACCESS_KEY}`);
    const data = await res.json();
    currentImage = await loadImage(data.urls.regular);
  }

  const imgW = 835;
  const scale = imgW / currentImage.width;
  const imgH = currentImage.height * scale;
  const imgX = (canvas.width - imgW) / 2;
  const imgY = selectedFormat === "post" ? 70 : selectedFormat === "quadrado" ? 50 : 60;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(imgX, imgY, imgW, imgH, 50);
  ctx.clip();
  ctx.drawImage(currentImage, imgX, imgY, imgW, imgH);
  ctx.restore();

  // elementos visuais abaixo da imagem
  const corChave = selectedColor === "aleatoria" ? "azul" : selectedColor;
  const elementos = graphics[corChave];

  const topRight = await loadImage(elementos.topRight);
  const bottomLeft = await loadImage(elementos.bottomLeft);

  // topo direito: 85px da direita, 93px do topo
  const topX = canvas.width - topRight.width - 85;
  const topY = 93;
  ctx.drawImage(topRight, topX, topY);

  // base esquerda: 27px da esquerda, 143px do fim para post; +50px para quadrado
  let bottomY = canvas.height - 143;
  if (selectedFormat === "quadrado") bottomY = canvas.height - 93;
  ctx.drawImage(bottomLeft, 27, bottomY);

  // texto (headline + texto + CTA)
  ctx.fillStyle = corChave === "branco" ? "#000" : corChave === "preto" ? "#fff" : corChave;
  ctx.font = "bold 40px Inter";
  ctx.textAlign = "center";
  ctx.fillText(currentPost.titulo, canvas.width / 2, imgY + imgH + 70);

  ctx.fillStyle = "#000";
  ctx.font = "24px Inter";
  ctx.fillText(currentPost.texto, canvas.width / 2, imgY + imgH + 120);
  ctx.font = "18px Inter";
  ctx.fillText("Fale com um especialista da CNPJ Legal agora mesmo.", canvas.width / 2, imgY + imgH + 160);

  captionDiv.innerText = currentPost.legenda;
  tagsDiv.innerText = currentPost.tags.join(" ");
  document.getElementById("postInfo").style.display = "block";

  generateBtn.disabled = false;
}

generateBtn.addEventListener("click", generatePost);

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
