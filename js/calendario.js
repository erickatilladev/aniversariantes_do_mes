// Lógica do calendário

/**
 * Renderiza o calendário com os aniversários
 */
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

    // Verificar se é do mês atual
    if (mesCalendario !== mesAtual || anoCalendario !== anoAtual) {
      diaElemento.classList.add("outro-mes");
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

      // Adicionar pontos baseados na quantidade de aniversariantes
      const qtdPontos = Math.min(aniversarios.length, 3);
      for (let i = 0; i < qtdPontos; i++) {
        const ponto = document.createElement("div");
        ponto.className = "indicador-ponto";
        indicador.appendChild(ponto);
      }

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

/**
 * Obtém aniversários filtrados por unidade
 * @returns {Object}
 */
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

/**
 * Processa os aniversários para o formato do calendário
 */
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

/**
 * Mostra detalhes dos aniversariantes de um dia específico
 * @param {number} dia
 * @param {number} mes
 * @param {number} ano
 * @param {Array} aniversarios
 */
function mostrarDetalhesDia(dia, mes, ano, aniversarios) {
  modalTitle.innerHTML = `<i class="fas fa-birthday-cake"></i> ${dia}/${mes} - ${aniversarios.length} Aniversariante(s)`;

  let modalHTML = `<div class="modal-aniversariantes">`;

  aniversarios.forEach((pessoa) => {
    const iniciais = obterIniciais(pessoa["Nome completo"]);

    modalHTML += `
            <div class="modal-card">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div class="card-avatar">${iniciais}</div>
                    <h4>${pessoa["Nome completo"]}</h4>
                </div>
                <p><i class="fas fa-envelope"></i> ${pessoa["E-mail"]}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${pessoa["Unidade"]}</p>
                <p><i class="fas fa-calendar-day"></i> ${pessoa["Data de nascimento"]}</p>
            </div>
        `;
  });

  modalHTML += `</div>`;

  modalContent.innerHTML = modalHTML;
  abrirModal();
}
