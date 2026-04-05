// =====================================================
// DADOS — Produtos
// =====================================================
const PRODUTOS = [
  { id: 1, nome: "Gravata Azul Florida", preco: 49.99, img: "./img/Azul com rosas.png", categoria: "floral", desc: "Gravata de tecido premium com estampa floral azul vibrante. Perfeita para casamentos e eventos formais." },
  { id: 2, nome: "Gravata Preta e Rosa", preco: 49.99, img: "./img/gravata-rosa.png", categoria: "floral", desc: "Combinação sofisticada de preto e rosa. Ideal para quem quer se destacar com elegância." },
  { id: 3, nome: "Gravata Roxa", preco: 49.99, img: "./img/gravata-roxa.png", categoria: "liso", desc: "Clássica gravata roxa com acabamento impecável. Versátil para diferentes tipos de terno." },
  { id: 4, nome: "Gravata Preta com Flores", preco: 49.99, precoAntes: 59.99, img: "./img/gravata-preta-origim.png", categoria: "floral", desc: "Exclusiva gravata preta com estampa floral discreta. Elegância e personalidade em um só produto." },
  { id: 5, nome: "Gravata Azul com Bolinhas", preco: 49.99, img: "./img/Azul com bolinhas.png", categoria: "pontilhado", desc: "Design clássico de bolinhas azuis. Um must-have para o guarda-roupa masculino." },
  { id: 6, nome: "Gravata Verde Pontilhada", preco: 49.99, img: "./img/gravata-verde-potilhada.png", categoria: "pontilhado", desc: "Verde pontilhado para homens que não têm medo de cor. Moderna e marcante." },
  { id: 7, nome: "Gravata Bordô Lisa", preco: 49.99, img: "./img/gravata-roxa.png", categoria: "liso", desc: "Cor bordô intensa em tecido liso de alta qualidade. Sofisticação pura." },
  { id: 8, nome: "Gravata Listrada Azul", preco: 54.99, img: "./img/Azul com bolinhas.png", categoria: "estampado", desc: "Listras clássicas em tons de azul. O equilíbrio perfeito entre tradição e modernidade." },
];

// =====================================================
// CARRINHO
// =====================================================
const CART_KEY = "lps_cart";

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); }

function addToCart(id) {
  const prod = PRODUTOS.find(p => p.id === id);
  if (!prod) return;
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id: prod.id, nome: prod.nome, preco: prod.preco, img: prod.img, qty: 1 });
  saveCart(cart);
  updateCartBadge();
  toast(`${prod.nome} adicionado ao carrinho!`);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  updateCartBadge();
  renderCarrinho();
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  saveCart(cart);
  updateCartBadge();
  renderCarrinho();
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((a, i) => a + i.qty, 0);
  const badge = document.getElementById("cart-badge");
  if (total > 0) { badge.textContent = total; badge.style.display = "flex"; }
  else { badge.style.display = "none"; }
}

function renderCarrinho() {
  const cart = getCart();
  const lista = document.getElementById("carrinho-lista");
  const empty = document.getElementById("carrinho-empty");
  const content = document.getElementById("carrinho-content");
  const resSubtotal = document.getElementById("res-subtotal");
  const resTotal = document.getElementById("res-total");
  if (!lista) return;

  if (cart.length === 0) {
    empty.style.display = "block";
    content.style.display = "none";
    return;
  }
  empty.style.display = "none";
  content.style.display = "grid";

  let sub = 0;
  lista.innerHTML = cart.map(item => {
    const itemTotal = item.preco * item.qty;
    sub += itemTotal;
    return `<div class="carrinho-item">
      <div class="item-info">
        <img class="item-img" src="${item.img}" alt="${item.nome}" onerror="this.src='https://via.placeholder.com/80x80/161616/e2d693?text=LPS'">
        <div>
          <div class="item-nome">${item.nome}</div>
          <div class="item-preco-unit">R$ ${item.preco.toFixed(2).replace(".", ",")}</div>
        </div>
      </div>
      <div class="item-qty-ctrl">
        <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
      </div>
      <div class="item-subtotal">R$ ${itemTotal.toFixed(2).replace(".", ",")}</div>
      <div class="item-remove" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></div>
    </div>`;
  }).join("");

  const fmt = v => "R$ " + v.toFixed(2).replace(".", ",");
  resSubtotal.textContent = fmt(sub);
  resTotal.textContent = fmt(sub);
}

function calcularFrete() {
  const cep = document.getElementById("cep-input").value.replace(/\D/g, "");
  if (cep.length < 8) { toast("CEP inválido! Digite 8 dígitos."); return; }
  const frete = Math.random() > 0.5 ? 0 : 12.90;
  const resFrete = document.getElementById("res-frete");
  const resTotal = document.getElementById("res-total");
  const cart = getCart();
  const sub = cart.reduce((a, i) => a + i.preco * i.qty, 0);
  resFrete.textContent = frete === 0 ? "Grátis 🎉" : "R$ " + frete.toFixed(2).replace(".", ",");
  resTotal.textContent = "R$ " + (sub + frete).toFixed(2).replace(".", ",");
  toast(frete === 0 ? "Frete grátis para sua região!" : `Frete: R$ ${frete.toFixed(2).replace(".", ",")}`);
}

function finalizarCompra() {
  const cart = getCart();
  if (cart.length === 0) return;
  saveCart([]);
  updateCartBadge();
  renderCarrinho();
  toast("Pedido realizado com sucesso! 🎉");
  setTimeout(() => showView("home"), 1800);
}

// =====================================================
// RENDERIZAR CARDS DE PRODUTO
// =====================================================
function prodCard(prod, showFull) {
  return `<div class="prod-card" onclick="openModal(${prod.id})">
    <div class="prod-card-img">
      <img src="${prod.img}" alt="${prod.nome}" onerror="this.src='https://via.placeholder.com/280x280/161616/e2d693?text=LPS'">
    </div>
    <div class="prod-card-info">
      <h3>${prod.nome}</h3>
      <div class="prod-card-preco">R$ ${prod.preco.toFixed(2).replace(".", ",")}${prod.precoAntes ? `<s>R$ ${prod.precoAntes.toFixed(2).replace(".", ",")}</s>` : ""}</div>
      <button class="btn-add" onclick="event.stopPropagation(); addToCart(${prod.id})">Adicionar ao Carrinho</button>
    </div>
  </div>`;
}

function renderGridHome() {
  const grid = document.getElementById("grid-home");
  if (!grid) return;
  grid.innerHTML = PRODUTOS.slice(0, 6).map(p => prodCard(p)).join("");
}

function renderGridProdutos(lista) {
  const grid = document.getElementById("grid-produtos");
  const count = document.getElementById("produtos-count");
  if (!grid) return;
  grid.innerHTML = lista.map(p => prodCard(p)).join("");
  if (count) count.textContent = `${lista.length} produto${lista.length !== 1 ? "s" : ""} encontrado${lista.length !== 1 ? "s" : ""}`;
}

function filtrarProdutos() {
  const min = parseFloat(document.getElementById("preco-min").value) || 0;
  const max = parseFloat(document.getElementById("preco-max").value) || Infinity;
  const cats = [...document.querySelectorAll(".sidebar input[type=checkbox]:checked")].map(c => c.value);
  const lista = PRODUTOS.filter(p => {
    const precoOk = p.preco >= min && p.preco <= max;
    const catOk = cats.length === 0 || cats.includes(p.categoria);
    return precoOk && catOk;
  });
  renderGridProdutos(lista);
}

// =====================================================
// MODAL PRODUTO
// =====================================================
let modalProdId = null;

function openModal(id) {
  const prod = PRODUTOS.find(p => p.id === id);
  if (!prod) return;
  modalProdId = id;
  document.getElementById("modal-img").src = prod.img;
  document.getElementById("modal-img").onerror = function () { this.src = "https://via.placeholder.com/300x300/161616/e2d693?text=LPS"; };
  document.getElementById("modal-nome").textContent = prod.nome;
  document.getElementById("modal-preco").textContent = "R$ " + prod.preco.toFixed(2).replace(".", ",");
  document.getElementById("modal-desc").textContent = prod.desc;
  document.getElementById("modal-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal(e) {
  if (e.target === document.getElementById("modal-overlay")) closeModalBtn();
}
function closeModalBtn() {
  document.getElementById("modal-overlay").classList.remove("open");
  document.body.style.overflow = "";
}
function adicionarModalAoCarrinho() {
  if (modalProdId) { addToCart(modalProdId); closeModalBtn(); }
}

// =====================================================
// AUTH FORMS
// =====================================================
const emailRgx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const senhaRgx = /^.{6,}$/;

function renderLogin() {
  document.getElementById("auth-container").innerHTML = `
    <div class="auth-box">
      <h1>Fazer Login</h1>
      <p class="auth-sub">Acesse sua conta LPS Gravatas</p>
      <label class="field-label">Email</label>
      <div class="field-wrap">
        <input class="field-input" type="email" id="login-email" placeholder="seu@email.com">
      </div>
      <label class="field-label">Senha</label>
      <div class="field-wrap">
        <input class="field-input" type="password" id="login-senha" placeholder="Sua senha">
        <i class="fa-solid fa-eye eye-toggle" onclick="togglePwd('login-senha',this)"></i>
      </div>
      <span class="esqueci-link" onclick="renderEsqueci()">Esqueceu minha senha?</span>
      <button class="btn-auth" onclick="doLogin()">Iniciar Sessão</button>
      <hr class="auth-divider">
      <p class="auth-link">Não possui conta? <a onclick="renderCadastro()">Cadastre-se</a></p>
    </div>`;
  bindValidation("login-email", emailRgx);
  bindValidation("login-senha", senhaRgx);
}

function renderCadastro() {
  document.getElementById("auth-container").innerHTML = `
    <div class="auth-box">
      <h1>Cadastre-se</h1>
      <p class="auth-sub">Crie sua conta gratuitamente</p>
      <label class="field-label">Nome Completo</label>
      <div class="field-wrap">
        <input class="field-input" type="text" id="cad-nome" placeholder="João Paulo">
      </div>
      <label class="field-label">Email</label>
      <div class="field-wrap">
        <input class="field-input" type="email" id="cad-email" placeholder="seu@email.com">
      </div>
      <label class="field-label">Telefone <span style="font-weight:400;color:#aaa">(opcional)</span></label>
      <div class="field-wrap">
        <input class="field-input" type="tel" id="cad-tel" placeholder="(11) 99999-9999">
      </div>
      <label class="field-label">Senha</label>
      <div class="field-wrap">
        <input class="field-input" type="password" id="cad-senha" placeholder="Mínimo 6 caracteres">
        <i class="fa-solid fa-eye eye-toggle" onclick="togglePwd('cad-senha',this)"></i>
      </div>
      <label class="field-label">Confirmar Senha</label>
      <div class="field-wrap">
        <input class="field-input" type="password" id="cad-confirma" placeholder="Repita a senha">
        <i class="fa-solid fa-eye eye-toggle" onclick="togglePwd('cad-confirma',this)"></i>
      </div>
      <div class="error-msg" id="erro-senha">As senhas não coincidem!</div>
      <button class="btn-auth" id="btn-cad" disabled onclick="doCadastro()">Cadastrar</button>
      <hr class="auth-divider">
      <p class="auth-link">Já possui conta? <a onclick="renderLogin()">Entrar</a></p>
    </div>`;
  bindValidation("cad-email", emailRgx);
  bindValidation("cad-senha", senhaRgx);
  const s1 = document.getElementById("cad-senha");
  const s2 = document.getElementById("cad-confirma");
  const err = document.getElementById("erro-senha");
  const btn = document.getElementById("btn-cad");

  const nome = document.getElementById("cad-nome").value.trim();
  const email = document.getElementById("cad-email").value.trim();
  const senha = document.getElementById("cad-senha").value; 

  const dados = {
    nome: nome,
    email: email,
    senha: senha
  };

  function checkSenhas() {
    if (!s2.value) { err.style.display = "none"; btn.disabled = true; return; }
    if (s1.value !== s2.value) { err.style.display = "block"; btn.disabled = true; }
    else { err.style.display = "none"; btn.disabled = !senhaRgx.test(s1.value); }
  }
  s1.addEventListener("input", checkSenhas);
  s2.addEventListener("input", checkSenhas);
}

function renderEsqueci() {
  document.getElementById("auth-container").innerHTML = `
    <div class="auth-box">
      <h1>Recuperar Senha</h1>
      <p class="auth-sub">Enviaremos um link para seu email</p>
      <label class="field-label">Email</label>
      <div class="field-wrap">
        <input class="field-input" type="email" id="esq-email" placeholder="seu@email.com">
      </div>
      <button class="btn-auth" onclick="doEsqueci()">Enviar Link</button>
      <hr class="auth-divider">
      <p class="auth-link"><a onclick="renderLogin()">← Voltar ao login</a></p>
    </div>`;
  bindValidation("esq-email", emailRgx);
}

function bindValidation(id, rgx) {
  const inp = document.getElementById(id);
  if (!inp) return;
  function check() {
    const v = inp.value.trim();
    inp.classList.remove("valid", "invalid");
    if (!v) return;
    inp.classList.add(rgx.test(v) ? "valid" : "invalid");
  }
  inp.addEventListener("input", check);
  inp.addEventListener("blur", check);
}

function togglePwd(id, icon) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === "password" ? "text" : "password";
  icon.classList.toggle("fa-eye");
  icon.classList.toggle("fa-eye-slash");
}

function doLogin() {
  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;
  if (!emailRgx.test(email) || !senhaRgx.test(senha)) {
    toast("Preencha os campos corretamente!");
    document.querySelectorAll("#auth-container .field-input").forEach(i => {
      if (!i.value) i.classList.add("invalid");
    });
    return;
  }
  toast("Login realizado com sucesso! 🎉");
  setTimeout(() => showView("home"), 1500);
}

async function doCadastro() {
  const nome = document.getElementById("cad-nome").value.trim();
  const email = document.getElementById("cad-email").value.trim();
  const senha = document.getElementById("cad-senha").value;

  // 2. Validação básica antes de enviar
  if (!nome || !emailRgx.test(email) || !senhaRgx.test(senha)) {
    toast("Preencha todos os campos corretamente!");
    return;
  }

  const dados = { 
    nome: nome, 
    email: email, 
    senha: senha };

  try {
    // 3. Envia para o seu backend C#
    const resposta = await fetch("https://localhost:3000/api/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
    
    if (resposta.ok) {
      toast("Cadastro realizado com sucesso! 🎉");
      setTimeout(() => renderLogin(), 1500);
    } else {
      toast("Erro ao cadastrar. Verifique os dados.");
    }    
  } catch (error) {
    console.error("Erro na requisição:", error);
    toast("Erro de conexão com o servidor.");
  }
}

function doEsqueci() {
  const email = document.getElementById("esq-email").value;
  if (!emailRgx.test(email)) { toast("Insira um email válido!"); return; }
  toast("Link de recuperação enviado! Verifique seu email.");
  setTimeout(() => renderLogin(), 2000);
}

// =====================================================
// NAVEGAÇÃO ENTRE VIEWS
// =====================================================
function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-link[data-view]").forEach(l => l.classList.remove("active"));
  const target = document.getElementById("view-" + name);
  if (target) { target.classList.add("active"); window.scrollTo(0, 0); }
  const navLink = document.querySelector(`.nav-link[data-view="${name}"]`);
  if (navLink) navLink.classList.add("active");

  if (name === "carrinho") renderCarrinho();
  if (name === "login") renderLogin();
  if (name === "produtos") renderGridProdutos(PRODUTOS);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// =====================================================
// TOAST
// =====================================================
let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
}

// =====================================================
// INIT
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  renderGridHome();
  renderGridProdutos(PRODUTOS);
  updateCartBadge();
});
