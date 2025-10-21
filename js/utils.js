// Funções utilitárias

/**
 * Obtém as iniciais de um nome completo
 * @param {string} nomeCompleto
 * @returns {string}
 */
function obterIniciais(nomeCompleto) {
  return nomeCompleto
    .split(" ")
    .map((nome) => nome[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Abre o cliente de e-mail padrão
 * @param {string} email
 */
function enviarEmail(email) {
  window.location.href = `mailto:${email}`;
}

/**
 * Formata uma data para o padrão brasileiro
 * @param {Date} data
 * @returns {string}
 */
function formatarDataBR(data) {
  return data.toLocaleDateString("pt-BR");
}

/**
 * Valida se uma string é uma data válida no formato DD/MM/AAAA
 * @param {string} data
 * @returns {boolean}
 */
function validarData(data) {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!regex.test(data)) return false;

  const [, dia, mes, ano] = data.match(regex);
  const dataObj = new Date(ano, mes - 1, dia);

  return (
    dataObj.getDate() == dia &&
    dataObj.getMonth() == mes - 1 &&
    dataObj.getFullYear() == ano
  );
}

/**
 * Ordena um array de objetos por uma propriedade específica
 * @param {Array} array
 * @param {string} propriedade
 * @param {boolean} crescente
 * @returns {Array}
 */
function ordenarPorPropriedade(array, propriedade, crescente = true) {
  return array.sort((a, b) => {
    const valorA = a[propriedade].toLowerCase();
    const valorB = b[propriedade].toLowerCase();

    if (valorA < valorB) return crescente ? -1 : 1;
    if (valorA > valorB) return crescente ? 1 : -1;
    return 0;
  });
}

/**
 * Debounce function para otimizar eventos
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Filtra dados baseado em múltiplos critérios
 * @param {Array} dados
 * @param {Object} filtros
 * @returns {Array}
 */
function filtrarDados(dados, filtros) {
  return dados.filter((item) => {
    return Object.keys(filtros).every((chave) => {
      if (!filtros[chave]) return true;

      const valorItem = item[chave]?.toString().toLowerCase() || "";
      const valorFiltro = filtros[chave].toString().toLowerCase();

      return valorItem.includes(valorFiltro);
    });
  });
}
