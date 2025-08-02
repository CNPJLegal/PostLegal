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
  stories: { width: 1080, height: 1920 }
};

let currentFormat = "post";
let lastColor = null;
let lastContent = null;

// 🎯 IA - chamada do endpoint
async function chamarIA(prompt) {
  try {
    const res = await fetch("/api/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const json = await res.json();
    return json.result || "";
  } catch (err) {
    alert("Erro ao chamar IA.");
    return "";
  }
}

// 🎯 IA - gerar tema se vazio
async function gerarTemaIA() {
  const prompt = "Gere 5 temas criativos e atuais para posts sobre abrir CNPJ e empreendedorismo.";
  const texto = await chamarIA(prompt);
  const temas = texto.split("\n").map(l => l.replace(/^\d+[-*\.]?\s*/, "").trim()).filter(Boolean);
  return temas[Math.floor(Math.random() * temas.length)] || "Empreendedorismo Legal";
}

// 🎯 IA - gerar conteúdo com headline, subheadline, mensagem
async function gerarConteudoIA(tema) {
  const prompt = `TEMA: ${tema}\nHEADLINE: título impactante\nSUBHEADLINE: reforço útil\nMENSAGEM: frase prática.`;
  const texto = await chamarIA(prompt);

  const extract = campo => {
    const match = texto.match(new RegExp(`${campo}:\s*(.+)`, "i"));
    return match?.[1]?.trim() || "";
  };

  return {
    tema,
    headline: extract("HEADLINE"),
    subheadline: extract("SUBHEADLINE"),
    mensagem: extract("MENSAGEM")
  };
}

// 🎨 Desenho do post
async function drawPost({ tema, headline, subheadline, mensagem, format, color }) {
  const { width, height } = formats[format];
  canvas.width = width;
  canvas.height = height;

  // Fundo
  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  // Texto
  ctx.fillStyle = color === "branco" ? "#000" : "#fff";
  ctx.textAlign = "center";

  ctx.font = "bold 24px Inter";
  ctx.fillText(tema, width / 2, height / 2 - 200);

  ctx.font = "bold 48px Inter";
  ctx.fillText("CNPJ Legal", width / 2, height / 2 - 150);

  ctx.font = "bold 38px Inter";
  ctx.fillText(headline, width / 2, height / 2 - 80);

  ctx.font = "28px Inter";
  ctx.fillText(subheadline, width / 2, height / 2 - 30);

  ctx.font = "20px Inter";
  ctx.fillText(mensagem, width / 2, height / 2 + 30);

  // Logotipo (centralizado na base)
  const logo = await carregarLogo(logos[color]);
  const logoWidth = 120;
  const ratio = logo.height / logo.width;
  const logoHeight = logoWidth * ratio;
  const logoX = (width - logoWidth) / 2;
  const logoY = height - logoHeight - 40;

  ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
}

// 🖼️ Carregar imagem de logo externa
function carregarLogo(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// 🎯 Botão GERAR
document.getElementById("generateBtn").addEventListener("click", async () => {
  const themeInput = document.getElementById("themeInput").value.trim();
  const temaFinal = themeInput || await gerarTemaIA();
  const conteudo = await gerarConteudoIA(temaFinal);
  lastContent = conteudo;

  const format = currentFormat;
  const color = getRandomColor(); // força cor nova
  lastColor = color;

  await drawPost({ ...conteudo, format, color });

  // Marca botão selecionado
  document.querySelectorAll(".color-btn").forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.color === color);
  });
});

// 🎯 Botão BAIXAR
document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "post-cnpj-legal.png";
  link.href = canvas.toDataURL();
  link.click();
});

// 🎯 Seleção de COR
document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    lastColor = btn.dataset.color;
    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    if (lastContent) {
      drawPost({ ...lastContent, format: currentFormat, color: lastColor });
    }
  });
});

// 🎯 Seleção de FORMATO
document.querySelectorAll(".dimension-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentFormat = btn.dataset.format;
    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    if (lastContent) {
      drawPost({ ...lastContent, format: currentFormat, color: lastColor || getRandomColor() });
    }
  });
});

// 💡 Gera cor aleatória diferente da última
function getRandomColor() {
  const keys = Object.keys(colors).filter(k => k !== lastColor);
  return keys[Math.floor(Math.random() * keys.length)];
}
