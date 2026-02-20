function renderAdminTable() {
  const body = document.getElementById('productsTableBody');
  if (!body) return;
  const products = getProducts();
  body.innerHTML = products.map((p) => `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${currencyBRL(p.price)}</td>
      <td>${p.promo ? 'Sim' : 'Nao'}</td>
    </tr>
  `).join('');
}

function setupAdminForm() {
  const form = document.getElementById('adminProductForm');
  const status = document.getElementById('adminStatus');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const price = Number(formData.get('price'));
    const promoPriceRaw = String(formData.get('promoPrice') || '').trim();
    const promoPrice = promoPriceRaw ? Number(promoPriceRaw) : null;

    if (!name || !category || !description || Number.isNaN(price) || price <= 0) {
      showStatus(status, 'Preencha os campos obrigatorios corretamente.', 'error');
      return;
    }

    if (promoPrice !== null && (Number.isNaN(promoPrice) || promoPrice <= 0 || promoPrice >= price)) {
      showStatus(status, 'Preco promocional deve ser menor que o preco normal.', 'error');
      return;
    }

    const products = getProducts();
    const nextId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;

    products.push({
      id: nextId,
      name,
      category,
      description,
      price,
      promo: promoPrice !== null,
      promoPrice
    });

    saveProducts(products);
    form.reset();
    showStatus(status, 'Produto cadastrado com sucesso.', 'ok');
    renderAdminTable();
  });
}

if (requireAdmin()) {
  setupHeaderAuth();
  renderAdminTable();
  setupAdminForm();
}
