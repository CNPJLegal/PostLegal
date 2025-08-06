// 👇 Aqui está o script.js COMPLETO e ATUALIZADO com todas as funcionalidades corretas

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
let currentColor = "aleatoria";
let cachedImage = null;

const canvasContainer = document.querySelector(".canvas-container");
const editableTextContainer = document.getElementById("editableTextContainer");

function getRandomColor() {
  const colorKeys = Object.keys(colors).filter(c => c !== "aleatoria");
  return colorKeys[Math.floor(Math.random() * colorKeys.length)];
}

function createEditableText(id, text, className) {
  const div = document.createElement("div");
  div.id = id;
  div.className = `editable-text ${className}`;
  div.contentEditable = true;
  div.innerText = text;
  editableTextContainer.appendChild(div);
}

function clearEditableTexts() {
  editableTextContainer.innerHTML = "";
}

function drawCanvas() {
  const { width, height } = formats[currentFormat];
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const color = currentColor === "aleatoria" ? getRandomColor() : currentColor;
  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (cachedImage) {
    const imgW = canvas.width;
    const imgH = cachedImage.height * (imgW / cachedImage.width);
    const x = 0;
    const y = formats[currentFormat].topOffset;
    ctx.drawImage(cachedImage, x, y, imgW, imgH);
  }
}

function gerarTextoAleatorio() {
  const temas = [
    "Impulsione seu negócio hoje mesmo",
    "Regularize seu CNPJ com agilidade",
    "Cresça com segurança",
    "Empreenda com o CNPJ Legal",
    "Post inteligente. Resultado de verdade."
  ];

  const subtemas = [
    "Descomplicamos a burocracia pra você",
    "Especialistas em MEI e microempresas",
    "Cuidamos do seu CNPJ do início ao sucesso",
    "Apoio completo para empreendedores reais"
  ];

  const ctas = [
    "Fale com um especialista",
    "Clique no link da bio",
    "Regularize agora",
    "Comece seu negócio do jeito certo"
  ];

  return {
    headline: temas[Math.floor(Math.random() * temas.length)],
    subheadline: subtemas[Math.floor(Math.random() * subtemas.length)],
    cta: ctas[Math.floor(Math.random() * ctas.length)]
  };
}

function aplicarTextoNoCanvas(texto) {
  clearEditableTexts();
  createEditableText("editableHeadline", texto.headline, "headline");
  createEditableText("editableSubheadline", texto.subheadline, "subheadline");
  createEditableText("editableCTA", texto.cta, "cta");
}

function generatePost() {
  drawCanvas();
  const texto = gerarTextoAleatorio();
  aplicarTextoNoCanvas(texto);
}

function downloadPost() {
  html2canvas(canvasContainer).then(canvas => {
    const link = document.createElement("a");
    link.download = "post-cnpj-legal.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

// EVENTOS

document.getElementById("generateBtn").addEventListener("click", generatePost);
document.getElementById("downloadBtn").addEventListener("click", downloadPost);

document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    currentColor = btn.dataset.color;
    drawCanvas();
  });
});

document.querySelectorAll(".dimension-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    currentFormat = btn.dataset.format;
    drawCanvas();
  });
});

document.getElementById("uploadImageInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = () => {
        cachedImage = img;
        drawCanvas();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("changeImageBtn").addEventListener("click", () => {
  fetch(`https://api.unsplash.com/photos/random?orientation=portrait&query=business&client_id=${window.UNSPLASH_ACCESS_KEY}`)
    .then(res => res.json())
    .then(data => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        cachedImage = img;
        drawCanvas();
      };
      img.src = data.urls.regular;
    });
});

document.getElementById("resetBtn").addEventListener("click", () => {
  cachedImage = null;
  clearEditableTexts();
  drawCanvas();
});

document.getElementById("zoomInBtn").addEventListener("click", () => {
  canvasContainer.style.transform = "scale(1.2)";
});

document.getElementById("zoomOutBtn").addEventListener("click", () => {
  canvasContainer.style.transform = "scale(1)";
});

// Primeira renderização
drawCanvas();
