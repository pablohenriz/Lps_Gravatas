# LPS Gravatas - Instruções para Agentes de IA

## Visão Geral
Projeto de e-commerce de gravatas (LPS Gravatas) construído com vanilla HTML/CSS/JavaScript. Não possui build process ou dependências externas - funciona diretamente no navegador.

## Arquitetura

### Estrutura de Arquivos
- **Páginas HTML**: `index.html`, `login.html`, `cadastro.html`, `produtos.html`, `promocoes.html`, `admin.html`, `esqueci-senha.html`
- **JS modular** (`js/`):
  - `data.js`: Camada de dados com localStorage
  - `auth.js`: Autenticação, sessão, e verificação de admin
  - `store.js`: Renderização de produtos (cards, grids)
  - `forms.js`: Handlers para login, cadastro, recuperação de senha
  - `admin.js`: Painel administrativo (CRUD de produtos)
- **Estilos**: `css/styles.css` com design dark (black/beige)

### Fluxo de Dados
1. **localStorage** → dados persistidos com prefixo `tg_` (users, products, session)
2. **Forms** → eventos dentro de JS modular coletam dados → validação → CRUD
3. **Renderização**: HTML templates gerados via JavaScript (não há templates HTML separados)

## Padrões Críticos

### 1. Autenticação e Autorização
- **Session**: Armazenada em `localStorage` via `tg_session` (id, name, email, role)
- **Roles**: `admin` e `customer`
- **Verificação**: `requireAdmin()` em `admin.html` redireciona não-admin para login
- **Logout**: Limpa session e redireciona para home

```javascript
// Exemplo: função em auth.js
getSession()  // retorna {id, name, email, role} ou null
setSession(userData)  // salva sessão
requireAdmin()  // valida e redireciona se não admin
```

### 2. Estrutura de Produto
```javascript
{
  id: number,           // identificador único
  name: string,         // nome do produto
  category: string,     // categoria (Social, Luxo, etc)
  price: number,        // preço normal em BRL
  promoPrice: number|null,  // preço promocional (null se sem promo)
  promo: boolean,       // flag: se tem desconto ativo
  description: string   // descrição breve
}
```

### 3. Mapeamento de Imagens
Arquivo `store.js` contém `productImages` (objeto id → caminho). Se imagem não mapeada, usa default.

### 4. Mensagens de Status
Padrão recorrente usando `showStatus(element, message, type)`:
- `type`: `'ok'` (verde) ou `'error'` (vermelho)
- Elemento deve existir no HTML (ex: `<div id="loginStatus"></div>`)

### 5. Validação de Dados
- **Emails**: convertidos para lowercase
- **Senhas**: mínimo 4 caracteres
- **Preços**: devem ser positivos; promoPrice < price
- **Strings**: trimadas antes de usar

## Convenções do Projeto

### Idioma e Localização
- Código em inglês, UI totalmente em português brasileiro
- Moeda: BRL via `Intl.NumberFormat` (função `currencyBRL()`)
- Caracteres acentuados preservados em strings

### Nomes de Variáveis
- `STORAGE` object: chaves com maiúsculas
- Funções: camelCase
- Arrays de dados: plural (users, products)

### localStorage Keys
- `tg_users`: array de usuários (seed: admin@gravattastore.com / admin123)
- `tg_products`: array de produtos (10 padrão com imagens mapeadas)
- `tg_session`: objeto da sessão atual

## Fluxos Principais

### Login
1. `setupLoginForm()` em `forms.js` intercepta submit
2. Valida email + senha contra `getUsers()`
3. Chama `setSession()` se encontrado
4. Redireciona para `admin.html` ou `index.html` conforme role

### Cadastro de Novo Usuário
1. `setupRegisterForm()` valida campos
2. Verifica se email já existe
3. Gera novo ID (max ID + 1)
4. Salva em `saveUsers()`

### Admin - Novo Produto
1. `requireAdmin()` valida acesso
2. Formulário em `admin.html` - `setupAdminForm()`
3. Valida: name, category, description, price obrigatórios
4. Se promoPrice providenciado: promo = true
5. Salva via `saveProducts()`, atualiza tabela

## Arquivo CSS
- **Variáveis CSS**: cores predefinidas (black, dark, beige, white, gray)
- **Container**: max-width 1200px com padding responsivo
- **Topbar**: sticky header com z-index 100
- **Cards**: produto com imagem, título, preço, botão

## Próximos Passos Comuns
- **Adicionar produto**: cadastrar em `data.js` (seed), mapear imagem em `productImages` do `store.js`
- **Novo campo no usuário**: atualizar `admin.html` form + validação em `setupAdminForm()`
- **Página nova**: criar HTML com IDs para `getElementById()` + função JS no arquivo apropriado
- **Editar/deletar**: verificar `list_code_usages()` de `saveUsers()`/`saveProducts()` para impacto
