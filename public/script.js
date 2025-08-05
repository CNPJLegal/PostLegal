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

const posts = [
  // [mesmos 3 exemplos de posts...]
];

function gerarVariaçãoDeTema(temaBase) {
  // [mesma lógica do tema]
}

function buscarConteudoPorTema(tema) {
  // [mesma lógica de buscar por tema]
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

async function getUnsplashImage(query) {
  const accessKey = window.UNSPLASH_ACCESS_KEY;
  if (!accessKey) throw new Error("Unsplash Access Key não definida.");

  const response = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${accessKey}`
  );
  if (!response.ok) throw new Error("Erro ao buscar imagem do Unsplash");

  const data = await response.json();
  return data.urls.regular;
}

async function drawPost({ tema, headline, subheadline, mensagem, legenda, tags, format, color }) {
  const { width, height } = formats[format];
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  // 👉 imagem do Unsplash com borda arredondada
  try {
    const imgUrl = await getUnsplashImage(tema);
    const img = await carregarImagem(imgUrl);

    const imgHeight = height * 0.35;
    const radius = 120;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, radius);
    ctx.arcTo(0, 0, radius, 0, radius);
    ctx.arcTo(width, 0, width, radius, radius);
    ctx.arcTo(width, imgHeight, width - radius, imgHeight, radius);
    ctx.arcTo(0, imgHeight, 0, radius, radius);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, 0, 0, width, imgHeight);
    ctx.restore();
  } catch (e) {
    console.warn("Erro ao carregar imagem do Unsplash:", e);
  }

  const gradient = ctx.createRadialGradient(width / 2, 0, 100, width / 2, height / 2, height);
  gradient.addColorStop(0, "rgba(0,0,0,0.4)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  let textColor = (color === "branco" || color === "verde") ? "#000" : "#fff";
  ctx.textAlign = "center";

  ctx.font = "bold 46px Inter";
  ctx.fillStyle = (color === "verde") ? "#000" : (color === "branco") ? "#0f3efa" : "#17e30d";
  wrapText(headline, width / 2, height / 2 - 200, width * 0.85, 50);

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
  loader.innerHTML = `<span style="
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 3px solid #fff;
    border-top: 3px solid transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;"></span> Gerando post...`;
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
