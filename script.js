const API_KEY = "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";

const canvas = document.getElementById("postCanvas");
const ctx = canvas.getContext("2d");

const colors = {
  azul: "#0f3efa",
  verde: "#17e30d",
  preto: "#1c1c1c",
  branco: "#ffffff"
};

const formats = {
  quadrado: { width: 1080, height: 1080 },
  post: { width: 1080, height: 1350 },
  stories: { width: 1080, height: 1920 }
};

let currentFormat = "post";
let lastColor = null;
let lastContent = null;

async function chamarIA(prompt) {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8
      })
    });

    const json = await res.json();
    return json.choices?.[0]?.message?.content || "";
  } catch (e) {
    console.error("Erro ao chamar IA:", e);
    return "";
  }
}

async function gerarTemaIA() {
  const prompt = "Gere 5 temas criativos e atuais para posts sobre abrir CNPJ e empreendedorismo.";
  const texto = await chamarIA(prompt);
  const temas = texto
    .split("\n")
    .map(l => l.replace(/^\d+[\-\*\.]?\s*/, "").trim())
    .filter(Boolean);
  return temas[Math.floor(Math.random() * temas.length)] || "Empreendedorismo Legal";
}

async function gerarConteudoIA(tema) {
  const prompt = `TEMA: ${tema}\nHEADLINE: título impactante\nSUBHEADLINE: reforço útil\nMENSAGEM: frase prática.`;
  const texto = await chamarIA(prompt);

  const extract = campo => {
    const match = texto.match(new RegExp(`${campo}:\\s*(.+)`, "i"));
    return match?.[1]?.trim() || "";
  };

  return {
    tema,
    headline: extract("HEADLINE"),
    subheadline: extract("SUBHEADLINE"),
    mensagem: extract("MENSAGEM")
  };
}

async function drawPost({ tema, headline, subheadline, mensagem, format, color }) {
  const { width, height } = formats[format];
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = colors[color];
  ctx.fillRect(0, 0, width, height);

  // logotipo correto conforme fundo
  const logo = new Image();
  logo.src = color === "branco"
    ? "https://iili.io/Fri8NTl.png"
    : "https://iili.io/Frik9yl.png";
  logo.crossOrigin = "anonymous";

  const drawTexts = () => {
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
  };

  return new Promise(resolve => {
    logo.onload = () => {
      drawTexts();
      ctx.drawImage(logo, width / 2 - 100, height - 120, 200, 60); // centralizado
      resolve();
    };
    logo.onerror = () => {
      drawTexts();
      resolve();
    };
  });
}

document.getElementById("generateBtn").addEventListener("click", async () => {
  const themeInput = document.getElementById("themeInput").value.trim();
  const temaFinal = themeInput || await gerarTemaIA();
  const conteudo = await gerarConteudoIA(temaFinal);
  const format = currentFormat || "post";

  let availableColors = Object.keys(colors).filter(c => c !== lastColor);
  const color = availableColors[Math.floor(Math.random() * availableColors.length)];
  lastColor = color;

  lastContent = { ...conteudo, format, color };
  await drawPost(lastContent);
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "post-cnpj-legal.png";
  link.href = canvas.toDataURL();
  link.click();
});

document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const selectedColor = btn.dataset.color;
    lastColor = selectedColor;

    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    if (lastContent) {
      await drawPost({ ...lastContent, color: selectedColor });
    }
  });
});

document.querySelectorAll(".dimension-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    currentFormat = btn.dataset.format;

    document.querySelectorAll(".dimension-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    if (lastContent) {
      await drawPost({ ...lastContent, format: currentFormat });
    }
  });
});
