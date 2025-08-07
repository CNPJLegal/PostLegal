
// 🎨 Canvas e variáveis principais
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

// 📚 Temas base
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
    Tema: temaBase,
    Headline: headlines[Math.floor(Math.random() * headlines.length)],
    Subheadline: subheadlines[Math.floor(Math.random() * subheadlines.length)],
    CTA: mensagens[Math.floor(Math.random() * mensagens.length)],
    Legenda: legendas[Math.floor(Math.random() * legendas.length)],
    Tags: tags
  };
}

// 🖌️ Função para desenhar post
function drawPost(content, bgColor, logoUrl) {
  const { width, height, topOffset } = formats[currentFormat];
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  const padding = 80;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";

  ctx.font = "bold 50px 'Inter'";
  ctx.fillText(content.Headline, width / 2, topOffset);

  ctx.font = "28px 'Inter'";
  ctx.fillText(content.Subheadline, width / 2, topOffset + 70);

  ctx.font = "20px 'Inter'";
  ctx.fillText(content.CTA, width / 2, topOffset + 140);

  ctx.font = "italic 20px 'Inter'";
  ctx.fillText(content.Legenda, width / 2, height - 100);

  ctx.font = "18px 'Inter'";
  ctx.fillText(content.Tags, width / 2, height - 50);

  const logo = new Image();
  logo.src = logoUrl;
  logo.onload = () => {
    ctx.drawImage(logo, width - 260, height - 130, 200, 80);
  };
}

// 🔄 Geração automática
function gerarPost() {
  const corSelecionada = document.querySelector('input[name="cor"]:checked')?.value || "azul";
  const corFinal = colors[corSelecionada];
  const logoFinal = logos[corSelecionada];

  const temaAleatorio = posts[Math.floor(Math.random() * posts.length)];
  const postVariação = gerarVariaçãoDeTema(temaAleatorio.Tema);

  lastColor = corFinal;
  lastContent = postVariação;

  drawPost(postVariação, corFinal, logoFinal);
}

// 💾 Download
function baixarImagem() {
  const link = document.createElement("a");
  link.download = "post-cnpj-legal.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// 🔁 Reset
function resetarPost() {
  if (lastContent && lastColor) {
    drawPost(lastContent, lastColor, logos[lastColor]);
  }
}

// 📱 Formato
document.querySelectorAll('input[name="formato"]').forEach((input) => {
  input.addEventListener("change", (e) => {
    currentFormat = e.target.value;
    if (lastContent && lastColor) {
      drawPost(lastContent, lastColor, logos[lastColor]);
    }
  });
});

// 🧩 Eventos
document.getElementById("gerarBtn").addEventListener("click", gerarPost);
document.getElementById("baixarBtn").addEventListener("click", baixarImagem);
document.getElementById("resetarBtn").addEventListener("click", resetarPost);

// Inicialização
gerarPost();
