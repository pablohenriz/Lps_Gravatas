function currencyBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function showStatus(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.className = `status ${type}`;
}

function getCartCountSafe() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function setupHeaderAuth() {
  const session = getSession();
  const authSlot = document.getElementById('authSlot');
  if (!authSlot) return;

  const cartCount = getCartCountSafe();
  let html = `<button id="openCartBtn" class="btn btn-outline cart-open" type="button">Carrinho <span id="cartCount" class="badge-count">${cartCount}</span></button>`;

  if (!session) {
    html += '<a class="btn btn-outline" href="login.html">Entrar</a>';
    authSlot.innerHTML = html;
    bindHeaderActions();
    return;
  }

  const adminLink = session.role === 'admin' ? '<a class="btn btn-outline" href="admin.html">Painel Admin</a>' : '';
  html += `${adminLink} <button id="logoutBtn" type="button">Sair (${session.name.split(' ')[0]})</button>`;
  authSlot.innerHTML = html;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      location.href = 'index.html';
    });
  }

  bindHeaderActions();
}

function bindHeaderActions() {
  const openCartBtn = document.getElementById('openCartBtn');
  if (!openCartBtn) return;
  openCartBtn.addEventListener('click', () => {
    if (typeof openCart === 'function') {
      openCart();
    } else {
      location.href = 'produtos.html';
    }
  });
}

function requireAdmin() {
  const session = getSession();
  if (!session || session.role !== 'admin') {
    location.href = 'login.html';
    return false;
  }
  return true;
}
