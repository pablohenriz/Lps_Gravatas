const productImages = {
  1: 'img/Azul com rosas.png',
  2: 'img/gravata-preta-origim.png',
  3: 'img/gravata-roxa.png',
  4: 'img/Gravat Preta 512x512.png',
  5: 'img/Azul com bolinhas.png',
  6: 'img/gravata-verde-potilhada.png',
  7: 'img/gravata-rosa.png',
  8: 'img/gravata-preta-origim.png',
  9: 'img/Design sem nome (4).png',
  10: 'img/Design sem nome (3).png'
};

function getProductImage(productId) {
  return productImages[productId] || 'img/Gravat Preta 512x512.png';
}

function getEffectivePrice(product) {
  return product.promo && product.promoPrice ? product.promoPrice : product.price;
}

function productCard(product) {
  const price = getEffectivePrice(product);
  const old = product.promo && product.promoPrice ? `<span class="old-price">${currencyBRL(product.price)}</span>` : '';
  const tag = product.promo ? '<span class="tag">Promocao</span>' : '';
  const image = getProductImage(product.id);

  return `
    <article class="card reveal">
      <div class="card-media">
        <img src="${image}" alt="${product.name}" loading="lazy" />
      </div>
      <div class="card-body">
        ${tag}
        <h3>${product.name}</h3>
        <p class="help">${product.category}</p>
        <div class="price-row">
          <span class="price">${currencyBRL(price)}</span>
          ${old}
        </div>
        <button type="button" data-add-cart="${product.id}">Adicionar ao carrinho</button>
      </div>
    </article>
  `;
}

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (!el) return;
  const qty = getCart().reduce((sum, item) => sum + item.qty, 0);
  el.textContent = String(qty);
}

function addToCart(productId) {
  const products = getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ productId, qty: 1 });
  }

  saveCart(cart);
  updateCartCount();
  renderCartItems();
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
  updateCartCount();
  renderCartItems();
}

function changeCartQty(productId, delta) {
  const cart = getCart();
  const item = cart.find((entry) => entry.productId === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart(cart);
  updateCartCount();
  renderCartItems();
}

function mountCartDrawer() {
  if (document.getElementById('cartDrawer')) return;

  const drawer = document.createElement('aside');
  drawer.id = 'cartDrawer';
  drawer.className = 'cart-drawer';
  drawer.innerHTML = `
    <div class="cart-head">
      <h3>Seu carrinho</h3>
      <button id="closeCartBtn" type="button" class="btn btn-outline">Fechar</button>
    </div>
    <div id="cartItems" class="cart-items"></div>
    <div class="cart-foot">
      <p>Total: <strong id="cartTotal">${currencyBRL(0)}</strong></p>
      <button type="button" id="checkoutBtn">Finalizar compra</button>
    </div>
  `;

  const overlay = document.createElement('div');
  overlay.id = 'cartOverlay';
  overlay.className = 'cart-overlay';

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  overlay.addEventListener('click', closeCart);
  document.getElementById('closeCartBtn').addEventListener('click', closeCart);

  const checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtn.addEventListener('click', () => {
    const cart = getCart();
    if (!cart.length) {
      alert('Seu carrinho esta vazio.');
      return;
    }
    alert('Pedido enviado com sucesso!');
    saveCart([]);
    updateCartCount();
    renderCartItems();
    closeCart();
  });
}

function openCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (!drawer || !overlay) return;
  drawer.classList.add('is-open');
  overlay.classList.add('is-open');
}

function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (!drawer || !overlay) return;
  drawer.classList.remove('is-open');
  overlay.classList.remove('is-open');
}

function renderCartItems() {
  const list = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!list || !totalEl) return;

  const cart = getCart();
  const products = getProducts();

  if (!cart.length) {
    list.innerHTML = '<p class="help">Carrinho vazio.</p>';
    totalEl.textContent = currencyBRL(0);
    return;
  }

  let total = 0;
  list.innerHTML = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return '';
    const price = getEffectivePrice(product);
    total += price * item.qty;
    return `
      <article class="cart-item">
        <img src="${getProductImage(product.id)}" alt="${product.name}" />
        <div>
          <h4>${product.name}</h4>
          <p>${currencyBRL(price)} x ${item.qty}</p>
          <div class="cart-item-actions">
            <button type="button" data-cart-change="${product.id}|-1">-</button>
            <button type="button" data-cart-change="${product.id}|1">+</button>
            <button type="button" data-cart-remove="${product.id}" class="btn btn-outline">Remover</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  totalEl.textContent = currencyBRL(total);
}

function bindGlobalActions() {
  document.body.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const addBtn = target.closest('[data-add-cart]');
    if (addBtn instanceof HTMLElement) {
      const id = Number(addBtn.getAttribute('data-add-cart'));
      if (!Number.isNaN(id)) addToCart(id);
      return;
    }

    const removeBtn = target.closest('[data-cart-remove]');
    if (removeBtn instanceof HTMLElement) {
      const id = Number(removeBtn.getAttribute('data-cart-remove'));
      if (!Number.isNaN(id)) removeFromCart(id);
      return;
    }

    const changeBtn = target.closest('[data-cart-change]');
    if (changeBtn instanceof HTMLElement) {
      const value = changeBtn.getAttribute('data-cart-change') || '';
      const [idRaw, deltaRaw] = value.split('|');
      const id = Number(idRaw);
      const delta = Number(deltaRaw);
      if (!Number.isNaN(id) && !Number.isNaN(delta)) changeCartQty(id, delta);
      return;
    }

    const openBtn = target.closest('#openCartBtn');
    if (openBtn) {
      openCart();
    }
  });
}

function filterProducts(products) {
  const search = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const category = document.getElementById('categoryFilter')?.value || 'all';
  const promoOnly = document.getElementById('promoOnly')?.checked || false;
  const min = Number(document.getElementById('minPrice')?.value || 0);
  const max = Number(document.getElementById('maxPrice')?.value || 0);

  return products.filter((product) => {
    const nameMatch = `${product.name} ${product.description}`.toLowerCase().includes(search);
    const categoryMatch = category === 'all' || product.category === category;
    const promoMatch = !promoOnly || product.promo;
    const price = getEffectivePrice(product);
    const minMatch = min <= 0 || price >= min;
    const maxMatch = max <= 0 || price <= max;
    return nameMatch && categoryMatch && promoMatch && minMatch && maxMatch;
  });
}

function setupProductFilters(products) {
  const categorySelect = document.getElementById('categoryFilter');
  if (!categorySelect) return;

  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  categorySelect.innerHTML = '<option value="all">Todas as categorias</option>' + categories.map((cat) => `<option value="${cat}">${cat}</option>`).join('');

  ['searchInput', 'categoryFilter', 'promoOnly', 'minPrice', 'maxPrice'].forEach((id) => {
    const field = document.getElementById(id);
    if (!field) return;
    field.addEventListener('input', () => renderProductsPage(true));
    field.addEventListener('change', () => renderProductsPage(true));
  });
}

function renderProductsPage(resetVisible = false) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const allProducts = getProducts();
  if (!window.__productsVisible || resetVisible) {
    window.__productsVisible = 6;
  }

  if (!window.__filtersReady) {
    setupProductFilters(allProducts);
    window.__filtersReady = true;
  }

  const filtered = filterProducts(allProducts);
  const visible = window.__productsVisible;
  const slice = filtered.slice(0, visible);

  grid.innerHTML = slice.length
    ? slice.map(productCard).join('')
    : '<p class="help">Nenhum produto encontrado com esse filtro.</p>';

  const moreBtn = document.getElementById('moreProductsBtn');
  if (moreBtn) {
    moreBtn.style.display = visible >= filtered.length ? 'none' : 'inline-block';
  }

  const foundCount = document.getElementById('foundCount');
  if (foundCount) {
    foundCount.textContent = `${filtered.length} produto(s) encontrado(s)`;
  }

  setupReveals();
}

function renderHomeSections() {
  const products = getProducts();

  const featuredGrid = document.getElementById('homeProductsGrid');
  if (featuredGrid) {
    featuredGrid.innerHTML = products.slice(0, 3).map(productCard).join('');
  }

  const promoGrid = document.getElementById('homePromoGrid');
  if (promoGrid) {
    const promos = products.filter((p) => p.promo).slice(0, 3);
    promoGrid.innerHTML = promos.length
      ? promos.map(productCard).join('')
      : '<p class="help">Sem promocao ativa no momento.</p>';
  }

  setupReveals();
}

function renderPromoPage() {
  const grid = document.getElementById('promoGrid');
  if (!grid) return;
  const promos = getProducts().filter((p) => p.promo && p.promoPrice);
  if (!promos.length) {
    grid.innerHTML = '<p class="help">Nenhum produto em promocao no momento.</p>';
    return;
  }
  grid.innerHTML = promos.map(productCard).join('');
  setupReveals();
}

function setupReveals() {
  const elements = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach((el) => observer.observe(el));
}

function setupStore() {
  mountCartDrawer();
  bindGlobalActions();
  updateCartCount();
  renderCartItems();

  const moreBtn = document.getElementById('moreProductsBtn');
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      window.__productsVisible = (window.__productsVisible || 6) + 4;
      renderProductsPage();
    });
  }

  renderProductsPage();
  renderHomeSections();
  renderPromoPage();
}
