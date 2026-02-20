function setupLoginForm() {
  const form = document.getElementById('loginForm');
  const status = document.getElementById('loginStatus');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '').trim();

    const user = getUsers().find((u) => u.email.toLowerCase() === email && u.password === password);
    if (!user) {
      showStatus(status, 'Email ou senha invalidos.', 'error');
      return;
    }

    setSession({ id: user.id, name: user.name, email: user.email, role: user.role });
    showStatus(status, 'Login realizado com sucesso. Redirecionando...', 'ok');
    setTimeout(() => {
      location.href = user.role === 'admin' ? 'admin.html' : 'index.html';
    }, 700);
  });
}

function setupRegisterForm() {
  const form = document.getElementById('registerForm');
  const status = document.getElementById('registerStatus');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '').trim();

    if (!name || !email || password.length < 4) {
      showStatus(status, 'Preencha os dados e use senha com minimo de 4 caracteres.', 'error');
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === email)) {
      showStatus(status, 'Este email ja esta cadastrado.', 'error');
      return;
    }

    const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    users.push({ id: nextId, name, email, password, role: 'customer' });
    saveUsers(users);

    showStatus(status, 'Cadastro feito com sucesso. Agora voce pode entrar.', 'ok');
    form.reset();
  });
}

function setupForgotForm() {
  const form = document.getElementById('forgotForm');
  const status = document.getElementById('forgotStatus');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim().toLowerCase();

    const user = getUsers().find((u) => u.email.toLowerCase() === email);
    if (!user) {
      showStatus(status, 'Email nao encontrado na base.', 'error');
      return;
    }

    showStatus(status, `Solicitacao enviada. Senha atual registrada: ${user.password}`, 'ok');
  });
}

setupHeaderAuth();
setupLoginForm();
setupRegisterForm();
setupForgotForm();

if (typeof setupStore === 'function') {
  setupStore();
}
