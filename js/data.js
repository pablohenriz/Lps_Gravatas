const STORAGE = {
  users: 'tg_users',
  session: 'tg_session',
  products: 'tg_products',
  cart: 'tg_cart'
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedData() {
  const users = readJSON(STORAGE.users, null);
  if (!users) {
    writeJSON(STORAGE.users, [
      {
        id: 1,
        name: 'Administrador',
        email: 'admin@gravattastore.com',
        password: 'admin123',
        role: 'admin'
      }
    ]);
  }

  const products = readJSON(STORAGE.products, null);
  if (!products) {
    writeJSON(STORAGE.products, [
      { id: 1, name: 'Gravata Classic Noir', category: 'Social', price: 89.9, promoPrice: null, promo: false, description: 'Tecido premium com acabamento fosco.' },
      { id: 2, name: 'Gravata Beige Prime', category: 'Casamento', price: 119.9, promoPrice: 94.9, promo: true, description: 'Tom bege elegante para eventos formais.' },
      { id: 3, name: 'Slim Carbon', category: 'Moderna', price: 79.9, promoPrice: null, promo: false, description: 'Modelo slim para visual contemporaneo.' },
      { id: 4, name: 'Velvet Black', category: 'Luxo', price: 149.9, promoPrice: 124.9, promo: true, description: 'Acabamento aveludado sofisticado.' },
      { id: 5, name: 'Golden Sand', category: 'Festa', price: 109.9, promoPrice: null, promo: false, description: 'Textura discreta com brilho refinado.' },
      { id: 6, name: 'Noir Satin', category: 'Executiva', price: 99.9, promoPrice: null, promo: false, description: 'Satinada para reunioes e ambientes premium.' },
      { id: 7, name: 'Beige Minimal', category: 'Casual Chic', price: 74.9, promoPrice: 59.9, promo: true, description: 'Leve e versatil para looks urbanos.' },
      { id: 8, name: 'Midnight Stripe', category: 'Social', price: 92.9, promoPrice: null, promo: false, description: 'Listras finas em preto profundo.' },
      { id: 9, name: 'Royal Earth', category: 'Luxo', price: 164.9, promoPrice: 139.9, promo: true, description: 'Peca assinada com tecido importado.' },
      { id: 10, name: 'Matte Beige Flex', category: 'Dia a dia', price: 69.9, promoPrice: null, promo: false, description: 'Confortavel e com excelente caimento.' }
    ]);
  }

  const cart = readJSON(STORAGE.cart, null);
  if (!cart) {
    writeJSON(STORAGE.cart, []);
  }
}

function getProducts() {
  return readJSON(STORAGE.products, []);
}

function saveProducts(products) {
  writeJSON(STORAGE.products, products);
}

function getUsers() {
  return readJSON(STORAGE.users, []);
}

function saveUsers(users) {
  writeJSON(STORAGE.users, users);
}

function getSession() {
  return readJSON(STORAGE.session, null);
}

function setSession(session) {
  writeJSON(STORAGE.session, session);
}

function clearSession() {
  localStorage.removeItem(STORAGE.session);
}

function getCart() {
  return readJSON(STORAGE.cart, []);
}

function saveCart(cart) {
  writeJSON(STORAGE.cart, cart);
}

seedData();
