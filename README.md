# Portal HUB

Portal HUB é uma plataforma web que conecta empresas brasileiras, facilitando a descoberta e transação de produtos e serviços entre empresas cadastradas.

## Objetivo do Projeto

O Portal HUB foi desenvolvido para criar um ecossistema digital onde empresas podem:

- Cadastrar e gerenciar seus perfis corporativos
- Publicar produtos e serviços no catálogo compartilhado
- Descobrir e negociar com outras empresas da rede
- Acompanhar transações e estatísticas em tempo real
- Administrar aprovações e verificações de empresas

## Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura das páginas web
- **CSS3** - Estilização e design responsivo
- **JavaScript (ES6+)** - Lógica de interação e manipulação do DOM

### Backend/Banco de Dados
- **Supabase** - Plataforma backend-as-a-service
  - PostgreSQL como banco de dados
  - Autenticação de usuários
  - Row Level Security (RLS) para segurança de dados
  - API RESTful automática

### Ferramentas de Desenvolvimento
- **Vite** - Build tool e servidor de desenvolvimento
- **npm** - Gerenciador de pacotes

## Estrutura do Projeto

```
portal-hub/
├── index.html              # Página de login principal
├── pages/                  # Páginas HTML do sistema
│   ├── register.html       # Cadastro de empresas
│   ├── dashboard.html      # Dashboard principal
│   ├── catalog.html        # Catálogo de produtos/serviços
│   ├── transactions.html   # Histórico de transações
│   ├── company-register.html  # Cadastro de nova empresa
│   ├── admin-login.html    # Login administrativo
│   ├── admin-dashboard.html # Dashboard do administrador
│   └── forgot-password.html # Recuperação de senha
├── css/                    # Arquivos de estilo
│   ├── reset.css          # Reset de estilos padrão
│   ├── login.css          # Estilos da página de login
│   ├── register.css       # Estilos do cadastro
│   ├── dashboard.css      # Estilos do dashboard
│   └── ...                # Outros arquivos CSS
├── js/                     # Scripts JavaScript
│   ├── login.js           # Lógica de autenticação
│   ├── register.js        # Lógica de cadastro
│   ├── dashboard.js       # Lógica do dashboard
│   └── ...                # Outros scripts
├── supabase/               # Configurações do Supabase
│   └── migrations/        # Migrações do banco de dados
├── package.json           # Dependências do projeto
└── README.md             # Este arquivo
```

## Como Rodar o Projeto

### Pré-requisitos

- **Node.js** (versão 16 ou superior)
- **npm** (geralmente vem com Node.js)
- Conta no **Supabase** (para banco de dados)

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd portal-hub
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse o projeto no navegador:
```
http://localhost:5173
```

### Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

### Deploy no GitHub Pages

Para publicar o projeto no GitHub Pages:

1. Build do projeto:
```bash
npm run build
```

2. Configure o GitHub Pages:
   - Vá em Settings > Pages no seu repositório
   - Selecione "Deploy from a branch"
   - Escolha "gh-pages" ou configure para usar a pasta `dist/`

3. O site estará disponível em:
```
https://<seu-usuario>.github.io/<nome-do-repositorio>
```

## Funcionalidades Principais

### Para Empresas
- Login e registro de empresas
- Dashboard com estatísticas e métricas
- Catálogo de produtos e serviços
- Gestão de transações
- Perfil corporativo personalizável

### Para Administradores
- Painel administrativo dedicado
- Aprovação de cadastros de empresas
- Gerenciamento de produtos/serviços
- Visualização de todas as transações
- Estatísticas globais da plataforma

## Desenvolvedores

Este projeto foi desenvolvido por:

- **Paulo Henrique Lins Matos**
- **Taue Santos**

---

### **OBS: O site pode está apresentando leves erros, pois não possuo muito conhecimento sobre github. Logo iremos atualizar os arquivos, para melhor entendimento do mesmo!!!**

Desenvolvido para conectar empresas e facilitar negócios.
