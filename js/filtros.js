/**
 * Renderiza a lista de aniversariantes
 */
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

  // Aplica filtro de busca
  if (termoBusca) {
    aniversariantesFiltrados = aniversariantesFiltrados.filter((pessoa) => {
      const nome = pessoa["Nome completo"]?.toLowerCase() || "";
      const email = pessoa["E-mail"]?.toLowerCase() || "";
      const unidade = pessoa["Unidade"]?.toLowerCase() || "";

      return (
        nome.includes(termoBusca) ||
        email.includes(termoBusca) ||
        unidade.includes(termoBusca)
      );
    });
  }

  // Agrupa por unidade (apenas se estamos mostrando todas as unidades)
  const agrupados = {};
  if (unidadeAtiva === "Todas") {
    aniversariantesFiltrados.forEach((pessoa) => {
      const unidade = pessoa["Unidade"];
      if (!agrupados[unidade]) agrupados[unidade] = [];
      agrupados[unidade].push(pessoa);
    });
  }

  // Monta o HTML
  const lista = document.getElementById("lista-aniversariantes");

  if (aniversariantesFiltrados.length === 0) {
    lista.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-birthday-cake"></i>
                <p>Nenhum aniversariante encontrado 😢</p>
                <p>Tente selecionar outra unidade, alterar sua busca ou verificar novamente no próximo mês.</p>
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
                    <h2><i class="fas fa-map-marker-alt"></i> ${unidade}</h2>
                    <div class="${
                      modoVisualizacao === "grid"
                        ? "aniversariantes-grid"
                        : "aniversariantes-list"
                    }">
                        ${agrupados[unidade]
                          .map((pessoa) => criarCard(pessoa))
                          .join("")}
                    </div>
                </section>
            `;
    }
  } else {
    // Se estamos mostrando uma unidade específica, apenas mostrar os cards
    html = `
            <div class="${
              modoVisualizacao === "grid"
                ? "aniversariantes-grid"
                : "aniversariantes-list"
            }">
                ${aniversariantesFiltrados
                  .map((pessoa) => criarCard(pessoa))
                  .join("")}
            </div>
        `;
  }

  lista.innerHTML = html;
}

/**
 * Cria o card de um aniversariante
 * @param {Object} pessoa
 * @returns {string}
 */
function criarCard(pessoa) {
  const iniciais = obterIniciais(pessoa["Nome completo"]);

  if (modoVisualizacao === "list") {
    return `
            <div class="card aniversariante-card">
                <div style="display: flex; align-items: center; width: 100%;">
                    <div class="card-avatar">${iniciais}</div>
                    <div class="card-content" style="flex: 1;">
                        <h3>${pessoa["Nome completo"]}</h3>
                        <div class="data-nascimento">
                            <i class="fas fa-birthday-cake"></i> ${pessoa["Data de nascimento"]}
                        </div>
                        <a class="email" href="mailto:${pessoa["E-mail"]}">
                            <i class="fas fa-envelope"></i> ${pessoa["E-mail"]}
                        </a>
                        <div class="unidade">
                            <i class="fas fa-map-marker-alt"></i> ${pessoa["Unidade"]}
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn-icon" onclick="enviarEmail('${pessoa["E-mail"]}')" title="Enviar e-mail">
                            <i class="fas fa-envelope"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  // Modo grid (padrão)
  return `
        <div class="card aniversariante-card">
            <div class="card-avatar">${iniciais}</div>
            <h3>${pessoa["Nome completo"]}</h3>
            <div class="data-nascimento">
                <i class="fas fa-birthday-cake"></i> ${pessoa["Data de nascimento"]}
            </div>
            <a class="email" href="mailto:${pessoa["E-mail"]}">
                <i class="fas fa-envelope"></i> ${pessoa["E-mail"]}
            </a>
            <div class="unidade">
                <i class="fas fa-map-marker-alt"></i> ${pessoa["Unidade"]}
            </div>
            <div class="card-actions">
                <button class="btn-icon" onclick="enviarEmail('${pessoa["E-mail"]}')" title="Enviar e-mail">
                    <i class="fas fa-envelope"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * Inicializa a navegação por unidades
 */
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

// Event listeners para busca com debounce
searchInput.addEventListener(
  "input",
  debounce((e) => {
    termoBusca = e.target.value.toLowerCase();
    renderizarAniversariantes();
  }, 300)
);

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
