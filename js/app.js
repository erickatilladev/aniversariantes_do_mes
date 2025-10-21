// Configuração da planilha
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCzs6JUWoPCpDKT31_jR_JSAcxNeSWXuIxtBj5UxTZGlzYVNJAtIDhCCay1T4o43gynOwvyqwdCKxW/pub?output=csv";

// Estado da aplicação
let dadosCompletos = [];
let unidadeAtiva = "Todas";
let mesCalendario = new Date().getMonth();
let anoCalendario = new Date().getFullYear();
let aniversariosPorData = {};
let modoVisualizacao = "grid"; // 'grid' ou 'list'
let termoBusca = "";

// Elementos DOM
let calendarioGrid, calendarioMesAno, prevMonthBtn, nextMonthBtn;
let prevYearBtn, nextYearBtn, todayBtn;
let unidadeSelecionadaSpan, unidadeSelecionadaListaSpan;
let searchInput, viewGridBtn, viewListBtn;
let modalOverlay, modalContent, modalTitle, closeModalBtn;
let loadingOverlay;

// Inicializar a aplicação
document.addEventListener("DOMContentLoaded", function () {
  inicializarElementos();
  carregarAniversariantes();
});

function inicializarElementos() {
  // Elementos do calendário
  calendarioGrid = document.getElementById("calendario-grid");
  calendarioMesAno = document.getElementById("calendario-mes-ano");
  prevMonthBtn = document.getElementById("prev-month");
  nextMonthBtn = document.getElementById("next-month");
  prevYearBtn = document.getElementById("prev-year");
  nextYearBtn = document.getElementById("next-year");
  todayBtn = document.getElementById("today-btn");

  // Elementos de unidade
  unidadeSelecionadaSpan = document.getElementById("unidade-selecionada");
  unidadeSelecionadaListaSpan = document.getElementById(
    "unidade-selecionada-lista"
  );

  // Elementos de busca e visualização
  searchInput = document.getElementById("search-input");
  viewGridBtn = document.getElementById("view-grid");
  viewListBtn = document.getElementById("view-list");

  // Elementos do modal
  modalOverlay = document.getElementById("modal-overlay");
  modalContent = document.getElementById("modal-content");
  modalTitle = document.getElementById("modal-title");
  closeModalBtn = document.getElementById("close-modal");

  // Elemento de loading
  loadingOverlay = document.getElementById("loading-overlay");

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

  prevYearBtn.addEventListener("click", () => {
    anoCalendario--;
    renderizarCalendario();
  });

  nextYearBtn.addEventListener("click", () => {
    anoCalendario++;
    renderizarCalendario();
  });

  todayBtn.addEventListener("click", () => {
    const hoje = new Date();
    mesCalendario = hoje.getMonth();
    anoCalendario = hoje.getFullYear();
    renderizarCalendario();
  });

  // *** CORREÇÃO: Event listeners para busca e visualização AQUI ***
  inicializarEventListeners();
}

/**
 * Inicializa os event listeners para busca e visualização
 */
function inicializarEventListeners() {
  // Event listener para busca
  searchInput.addEventListener("input", (e) => {
    termoBusca = e.target.value.toLowerCase();
    renderizarAniversariantes();
  });

  // Event listeners para visualização
  viewGridBtn.addEventListener("click", () => {
    modoVisualizacao = "grid";
    viewGridBtn.classList.add("active");
    viewListBtn.classList.remove("active");
    renderizarAniversariantes();
  });

  viewListBtn.addEventListener("click", () => {
    modoVisualizacao = "list";
    viewListBtn.classList.add("active");
    viewGridBtn.classList.remove("active");
    renderizarAniversariantes();
  });

  // Event listeners para modal
  closeModalBtn.addEventListener("click", fecharModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      fecharModal();
    }
  });

  // Fechar modal com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
      fecharModal();
    }
  });
}

/**
 * Carrega os dados dos aniversariantes da planilha
 */
async function carregarAniversariantes() {
  mostrarLoading();

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

    // Atualizar dashboard
    atualizarDashboard();

    // Renderizar calendário
    renderizarCalendario();

    // Renderizar aniversariantes
    renderizarAniversariantes();

    esconderLoading();
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    const lista = document.getElementById("lista-aniversariantes");
    lista.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ocorreu um erro ao carregar os aniversariantes.</p>
                <p>Tente novamente mais tarde.</p>
            </div>
        `;
    esconderLoading();
  }
}

/**
 * Atualiza o dashboard com estatísticas
 */
function atualizarDashboard() {
  // Total de colaboradores
  document.getElementById("total-colaboradores").textContent =
    dadosCompletos.length;

  // Aniversariantes do mês
  const mesAtual = new Date().getMonth() + 1;
  const aniversariantesMes = dadosCompletos.filter((pessoa) => {
    const data = pessoa["Data de nascimento"];
    if (!data || !data.includes("/")) return false;
    const partes = data.split("/");
    const mes = parseInt(partes[1]);
    return mes === mesAtual;
  });
  document.getElementById("aniversariantes-mes").textContent =
    aniversariantesMes.length;

  // Total de unidades
  const unidades = [...new Set(dadosCompletos.map((p) => p["Unidade"]))];
  document.getElementById("total-unidades").textContent = unidades.length;

  // Próximo aniversário
  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const mesAtualNum = hoje.getMonth() + 1;

  let proximoAniversario = null;

  dadosCompletos.forEach((pessoa) => {
    const data = pessoa["Data de nascimento"];
    if (!data || !data.includes("/")) return;

    const partes = data.split("/");
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]);

    // Se o aniversário for hoje ou no futuro deste mês
    if (mes === mesAtualNum && dia >= diaAtual) {
      if (!proximoAniversario || dia < proximoAniversario.dia) {
        proximoAniversario = { dia, nome: pessoa["Nome completo"] };
      }
    }
    // Se não houver aniversários neste mês, procurar no próximo mês
    else if (mes === mesAtualNum + 1 || (mesAtualNum === 12 && mes === 1)) {
      if (!proximoAniversario) {
        proximoAniversario = { dia, nome: pessoa["Nome completo"] };
      }
    }
  });

  if (proximoAniversario) {
    document.getElementById("proximo-aniversario").textContent = `${
      proximoAniversario.dia
    }/${mesAtualNum} - ${proximoAniversario.nome.split(" ")[0]}`;
  } else {
    document.getElementById("proximo-aniversario").textContent = "-";
  }

  // Atualizar contador no header
  document.getElementById("total-aniversariantes").textContent =
    aniversariantesMes.length;
}
