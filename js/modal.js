// Gerenciamento de modais

/**
 * Abre o modal
 */
function abrirModal() {
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

/**
 * Fecha o modal
 */
function fecharModal() {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

/**
 * Mostra loading
 */
function mostrarLoading() {
  if (loadingOverlay) {
    loadingOverlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

/**
 * Esconde loading
 */
function esconderLoading() {
  if (loadingOverlay) {
    loadingOverlay.style.display = "none";
    document.body.style.overflow = "auto";
  }
}
