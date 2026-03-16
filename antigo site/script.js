const toggles = document.querySelectorAll(".toggleSenha");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const entrarBtn = document.getElementById("entrar");

toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
        // Encontra o input relacionado a esse olho
        const input = toggle.previousElementSibling;

        if (input.type === "password") {
            input.type = "text";
            toggle.classList.remove("fa-eye");
            toggle.classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            toggle.classList.remove("fa-eye-slash");
            toggle.classList.add("fa-eye");
        }
    });
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const senhaRegex = /^.{6,}$/;

const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');

inputs.forEach(input => {
    const regex = input.type === "email" ? emailRegex : senhaRegex;

    // validação ao digitar
    input.addEventListener('input', () => validarInput(input, regex));

    // validação ao perder o foco
    input.addEventListener('blur', () => validarInput(input, regex));
});

function validarInput(input, regex) {
    const valor = input.value.trim();

    if (valor === "") {
        input.classList.remove("valid", "invalid"); // campo vazio → cor padrão
        return;
    }

    if (regex.test(valor)) {
        input.classList.add("valid");
        input.classList.remove("invalid");
    } else {
        input.classList.add("invalid");
        input.classList.remove("valid");
    }
}


// Eventos para validar enquanto o usuário digita

emailInput.addEventListener("input", () => validarInput(emailInput, emailRegex));

senhaInput.addEventListener("input", () => validarInput(senhaInput, senhaRegex));

// Função de validação genérica
function validarInput(input, regex) {
    const valor = input.value.trim();

    if (valor === "") {
        // Campo vazio → remove classes
        input.classList.remove("valid", "invalid");
        return;
    }

    if (regex.test(valor)) {
        // Se válido → azul
        input.classList.add("valid");
        input.classList.remove("invalid");
    } else {
        // Se inválido → vermelho
        input.classList.add("invalid");
        input.classList.remove("valid");
    }
}

entrarBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!emailRegex.test(emailInput.value) || !senhaRegex.test(senhaInput.value)) {
        alert("Por favor, preencha os campos corretamente.");
    } else {
        alert("Login realizado com sucesso!");
    }
});

const senha = document.getElementById("senha");
        const confirmarSenha = document.getElementById("confirmarSenha");
        const erroSenha = document.getElementById("erroSenha");
        const botao = document.getElementById("btnCadastrar");

        function validarSenha() {
            if (confirmarSenha.value === "") {
                erroSenha.style.display = "none";
                botao.disabled = true;
                return;
            }

            if (senha.value !== confirmarSenha.value) {
                erroSenha.style.display = "block";
                botao.disabled = true;
            } else {
                erroSenha.style.display = "none";
                botao.disabled = false;
            }
        }

        senha.addEventListener("input", validarSenha);
        confirmarSenha.addEventListener("input", validarSenha);

        document.getElementById("formCadastro").addEventListener("submit", function (e) {
            if (senha.value !== confirmarSenha.value) {
                e.preventDefault();
                alert("As senhas precisam ser iguais!");
            }
        });
