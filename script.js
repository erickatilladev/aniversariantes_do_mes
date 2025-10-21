const sheetUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCzs6JUWoPCpDKT31_jR_JSAcxNeSWXuIxtBj5UxTZGlzYVNJAtIDhCCay1T4o43gynOwvyqwdCKxW/pub?output=csv";

// Estado da aplicação
let dadosCompletos = [];
let unidadeAtiva = "Todas";
let mesCalendario = new Date().getMonth();
let anoCalendario = new Date().getFullYear();
let aniversariosPorData = {};

// Elementos DOM
let calendarioGrid, calendarioMesAno, prevMonthBtn, nextMonthBtn;
let unidadeSelecionadaSpan, unidadeSelecionadaListaSpan;

// Inicializar a aplicação
document.addEventListener("DOMContentLoaded", function () {
  inicializarElementos();
  carregarAniversariantes();
});

function inicializarElementos() {
  calendarioGrid = document.getElementById("calendario-grid");
  calendarioMesAno = document.getElementById("calendario-mes-ano");
  prevMonthBtn = document.getElementById("prev-month");
  nextMonthBtn = document.getElementById("next-month");
  unidadeSelecionadaSpan = document.getElementById("unidade-selecionada");
  unidadeSelecionadaListaSpan = document.getElementById(
    "unidade-selecionada-lista"
  );

  // Event listeners para navegação do calendário
  prevMonthBtn.addEventListener("click", () => {
    mesCalendario--;
    if (mesCalendario < 0) {
      mesCalendario = 11;
      anoCalendario--;
    }
    renderizarCalendario();
  });

  nextMonthBtn.addEventListener("click", () => {
    mesCalendario++;
    if (mesCalendario > 11) {
      mesCalendario = 0;
      anoCalendario++;
    }
    renderizarCalendario();
  });
}

async function carregarAniversariantes() {
  // Mostrar estado de carregamento
  const lista = document.getElementById("lista-aniversariantes");
  lista.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
    </div>
  `;

  try {
    const resposta = await fetch(sheetUrl);
    const texto = await resposta.text();

    const linhas = texto.split("\n").map((l) => l.split(","));
    const cabecalho = linhas[0].map((c) => c.trim());
    dadosCompletos = linhas.slice(1).map((linha) => {
      let obj = {};
      cabecalho.forEach((coluna, i) => {
        obj[coluna] = (linha[i] || "").replace(/"/g, "").trim();
      });
      return obj;
    });

    // Filtrar pessoas que têm unidade definida (remover "Sem unidade")
    dadosCompletos = dadosCompletos.filter((pessoa) => {
      const unidade = pessoa["Unidade"] || "";
      return unidade.trim() !== "" && unidade.trim() !== "Sem unidade";
    });

    // Atualizar nome do mês
    document.getElementById("mes-atual").textContent =
      new Date().toLocaleString("pt-BR", { month: "long" });

    // Processar aniversários para o calendário
    processarAniversariosParaCalendario();

    // Inicializar navegação por unidades
    inicializarNavegacaoUnidades();

    // Renderizar calendário
    renderizarCalendario();

    // Renderizar aniversariantes
    renderizarAniversariantes();
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    lista.innerHTML = `
      <div class="empty-state">
        <p>❌ Ocorreu um erro ao carregar os aniversariantes.</p>
        <p>Tente novamente mais tarde.</p>
      </div>
    `;
  }
}

function processarAniversariosParaCalendario() {
  aniversariosPorData = {};

  dadosCompletos.forEach((pessoa) => {
    const data = pessoa["Data de nascimento"];
    if (!data || !data.includes("/")) return;

    const partes = data.split("/");
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]);

    // Criar chave no formato "mes-dia" (ex: "5-15" para 15 de maio)
    const chave = `${mes}-${dia}`;

    if (!aniversariosPorData[chave]) {
      aniversariosPorData[chave] = [];
    }

    aniversariosPorData[chave].push(pessoa);
  });
}

function getAniversariosFiltrados() {
  if (unidadeAtiva === "Todas") {
    return aniversariosPorData;
  }

  // Filtrar aniversários por unidade
  const aniversariosFiltrados = {};

  Object.keys(aniversariosPorData).forEach((chave) => {
    const aniversariosDia = aniversariosPorData[chave].filter(
      (pessoa) => pessoa["Unidade"] === unidadeAtiva
    );

    if (aniversariosDia.length > 0) {
      aniversariosFiltrados[chave] = aniversariosDia;
    }
  });

  return aniversariosFiltrados;
}

function renderizarCalendario() {
  // Atualizar título do calendário com a unidade selecionada
  const textoUnidade =
    unidadeAtiva === "Todas" ? "Todas as Unidades" : unidadeAtiva;
  unidadeSelecionadaSpan.textContent = textoUnidade;

  // Atualizar título do calendário
  const dataCalendario = new Date(anoCalendario, mesCalendario);
  calendarioMesAno.textContent = dataCalendario.toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  // Limpar calendário (mantendo apenas os dias da semana)
  while (calendarioGrid.children.length > 7) {
    calendarioGrid.removeChild(calendarioGrid.lastChild);
  }

  // Obter primeiro dia do mês e quantidade de dias
  const primeiroDia = new Date(anoCalendario, mesCalendario, 1).getDay();
  const ultimoDia = new Date(anoCalendario, mesCalendario + 1, 0).getDate();

  // Obter aniversários filtrados por unidade
  const aniversariosFiltrados = getAniversariosFiltrados();

  // Adicionar dias vazios no início
  for (let i = 0; i < primeiroDia; i++) {
    const diaVazio = document.createElement("div");
    diaVazio.className = "dia-calendario vazio";
    calendarioGrid.appendChild(diaVazio);
  }

  // Adicionar dias do mês
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const diaAtual = hoje.getDate();

  for (let dia = 1; dia <= ultimoDia; dia++) {
    const diaElemento = document.createElement("div");
    diaElemento.className = "dia-calendario";

    // Verificar se é hoje
    if (
      dia === diaAtual &&
      mesCalendario === mesAtual &&
      anoCalendario === anoAtual
    ) {
      diaElemento.classList.add("hoje");
    }

    // Verificar se tem aniversários neste dia (considerando a unidade selecionada)
    const chave = `${mesCalendario + 1}-${dia}`;
    const aniversarios = aniversariosFiltrados[chave] || [];

    if (aniversarios.length > 0) {
      if (aniversarios.length === 1) {
        diaElemento.classList.add("aniversario");
      } else {
        diaElemento.classList.add("aniversario-multiplo");
      }

      // Adicionar tooltip
      diaElemento.title = `${aniversarios.length} aniversariante(s)`;
    }

    // Adicionar número do dia
    const numeroDia = document.createElement("div");
    numeroDia.className = "numero-dia";
    numeroDia.textContent = dia;
    diaElemento.appendChild(numeroDia);

    // Adicionar indicador se houver aniversários
    if (aniversarios.length > 0) {
      const indicador = document.createElement("div");
      indicador.className = "indicador-aniversario";
      diaElemento.appendChild(indicador);
    }

    // Event listener para mostrar detalhes
    if (aniversarios.length > 0) {
      diaElemento.addEventListener("click", () => {
        mostrarDetalhesDia(dia, mesCalendario + 1, anoCalendario, aniversarios);
      });
    }

    calendarioGrid.appendChild(diaElemento);
  }
}

function mostrarDetalhesDia(dia, mes, ano, aniversarios) {
  // Criar overlay do modal
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";

  // Criar modal
  const modal = document.createElement("div");
  modal.className = "modal";

  // Header do modal
  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";

  const titulo = document.createElement("h3");
  titulo.innerHTML = `🎂 ${dia}/${mes} - ${aniversarios.length} Aniversariante(s)`;

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-modal";
  closeBtn.innerHTML = "×";
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(modalOverlay);
  });

  modalHeader.appendChild(titulo);
  modalHeader.appendChild(closeBtn);

  // Conteúdo do modal
  const modalContent = document.createElement("div");
  modalContent.className = "modal-aniversariantes";

  aniversarios.forEach((pessoa) => {
    const card = document.createElement("div");
    card.className = "modal-card";

    card.innerHTML = `
      <h4>${pessoa["Nome completo"]}</h4>
      <p>📧 ${pessoa["E-mail"]}</p>
      <p>🏢 ${pessoa["Unidade"]}</p>
    `;

    modalContent.appendChild(card);
  });

  // Montar modal
  modal.appendChild(modalHeader);
  modal.appendChild(modalContent);
  modalOverlay.appendChild(modal);

  // Adicionar ao body
  document.body.appendChild(modalOverlay);

  // Fechar modal ao clicar fora
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      document.body.removeChild(modalOverlay);
    }
  });
}

function inicializarNavegacaoUnidades() {
  // Coletar todas as unidades únicas (excluindo vazias)
  const unidades = [
    ...new Set(
      dadosCompletos
        .map((pessoa) => pessoa["Unidade"])
        .filter((unidade) => unidade && unidade.trim() !== "")
    ),
  ];

  // Ordenar unidades alfabeticamente
  unidades.sort();

  // Adicionar opção "Todas" no início
  unidades.unshift("Todas");

  const navUnidades = document.getElementById("unidades-nav");
  navUnidades.innerHTML = "";

  unidades.forEach((unidade) => {
    const btn = document.createElement("button");
    btn.className = "unidade-btn";
    btn.textContent = unidade;
    if (unidade === "Todas") {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      // Remover classe active de todos os botões
      document.querySelectorAll(".unidade-btn").forEach((b) => {
        b.classList.remove("active");
      });

      // Adicionar classe active ao botão clicado
      btn.classList.add("active");

      // Atualizar unidade ativa
      unidadeAtiva = unidade;

      // Atualizar textos das seções
      const textoUnidade = unidade === "Todas" ? "Todas as Unidades" : unidade;
      unidadeSelecionadaSpan.textContent = textoUnidade;
      unidadeSelecionadaListaSpan.textContent = textoUnidade;

      // Renderizar calendário e aniversariantes
      renderizarCalendario();
      renderizarAniversariantes();
    });

    navUnidades.appendChild(btn);
  });
}

function renderizarAniversariantes() {
  const mesAtual = new Date().getMonth() + 1;

  // Filtra aniversariantes do mês
  const aniversariantesMes = dadosCompletos.filter((pessoa) => {
    const data = pessoa["Data de nascimento"];
    if (!data || !data.includes("/")) return false;
    const partes = data.split("/");
    const mes = parseInt(partes[1]);
    return mes === mesAtual;
  });

  // Aplica filtro de unidade se necessário
  let aniversariantesFiltrados = aniversariantesMes;
  if (unidadeAtiva !== "Todas") {
    aniversariantesFiltrados = aniversariantesMes.filter(
      (pessoa) => pessoa["Unidade"] === unidadeAtiva
    );
  }

  // Agrupa por unidade
  const agrupados = {};
  aniversariantesFiltrados.forEach((pessoa) => {
    const unidade = pessoa["Unidade"];
    if (!agrupados[unidade]) agrupados[unidade] = [];
    agrupados[unidade].push(pessoa);
  });

  // Monta o HTML
  const lista = document.getElementById("lista-aniversariantes");

  if (aniversariantesFiltrados.length === 0) {
    lista.innerHTML = `
      <div class="empty-state">
        <p>Nenhum aniversariante neste mês 😢</p>
        <p>Tente selecionar outra unidade ou verificar novamente no próximo mês.</p>
      </div>
    `;
    return;
  }

  let html = "";

  // Se estamos mostrando todas as unidades, agrupar por unidade
  if (unidadeAtiva === "Todas") {
    for (const unidade in agrupados) {
      html += `
        <section class="unidade-section">
          <h2>🏢 ${unidade}</h2>
          <div class="aniversariantes-grid">
            ${agrupados[unidade].map((pessoa) => criarCard(pessoa)).join("")}
          </div>
        </section>
      `;
    }
  } else {
    // Se estamos mostrando uma unidade específica, apenas mostrar os cards
    html = `
      <div class="aniversariantes-grid">
        ${aniversariantesFiltrados.map((pessoa) => criarCard(pessoa)).join("")}
      </div>
    `;
  }

  lista.innerHTML = html;
}

function criarCard(pessoa) {
  return `
    <div class="card">
      <h3>${pessoa["Nome completo"]}</h3>
      <div class="data-nascimento">🎂 ${pessoa["Data de nascimento"]}</div>
      <a class="email" href="mailto:${pessoa["E-mail"]}">
        ✉️ ${pessoa["E-mail"]}
      </a>
      <div class="unidade">🏢 ${pessoa["Unidade"]}</div>
    </div>
  `;
}
