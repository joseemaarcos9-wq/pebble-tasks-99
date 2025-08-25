<div align="center">
  <h1>🪨 Pebble Tasks</h1>
  <p><strong>Sistema Completo de Produtividade Pessoal</strong></p>
  <p>Gerencie suas tarefas e finanças em uma única aplicação moderna e intuitiva</p>

  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4.19-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

---

## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [🚀 Instalação](#-instalação)
- [⚙️ Configuração](#️-configuração)
- [📱 Como Usar](#-como-usar)
- [🗂️ Estrutura do Projeto](#️-estrutura-do-projeto)
- [🔗 API e Banco de Dados](#-api-e-banco-de-dados)
- [🎨 Interface e Design](#-interface-e-design)
- [🚀 Deploy](#-deploy)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

---

## 🎯 Sobre o Projeto

**Pebble Tasks** é uma aplicação web moderna e completa para gerenciamento de produtividade pessoal. Combina um sistema robusto de gerenciamento de tarefas com controle financeiro pessoal, oferecendo uma experiência unificada e intuitiva.

### 🌟 Destaques

- **Interface Moderna**: Design clean e responsivo com Tailwind CSS e shadcn/ui
- **Sistema Completo**: Tarefas, finanças e configurações em um só lugar
- **Tempo Real**: Sincronização instantânea com Supabase
- **Segurança**: Autenticação robusta e políticas RLS (Row Level Security)
- **Performance**: Otimizado com React Query e Zustand
- **Acessibilidade**: Componentes acessíveis e navegação por teclado

---

## ✨ Funcionalidades

### 📝 Sistema de Tarefas

- **Gerenciamento Completo de Tarefas**
  - ✅ Criar, editar, excluir e marcar como concluída
  - 🏷️ Sistema de tags personalizáveis
  - 📅 Datas de vencimento e lembretes
  - 🔗 Links e anexos de fotos
  - 📋 Subtarefas para maior organização

- **Organização Avançada**
  - 📂 Listas personalizadas com cores
  - 🎯 Prioridades (baixa, média, alta, urgente)
  - 🔍 Filtros avançados e busca
  - 👁️ Visualizações customizadas
  - ⏰ Tarefas atrasadas, hoje e da semana

### 💰 Sistema Financeiro

- **Controle de Contas**
  - 🏦 Múltiplas contas (carteira, banco, cartão)
  - 💳 Saldos e movimentações em tempo real
  - 🎨 Personalização com cores
  - 📊 Dashboard com estatísticas

- **Transações e Categorias**
  - 💸 Receitas e despesas detalhadas
  - 🏷️ Categorias hierárquicas personalizáveis
  - 🔄 Transações recorrentes
  - 📈 Orçamentos mensais
  - 🏷️ Sistema de tags financeiras

### 🔐 Autenticação e Segurança

- **Sistema de Usuários**
  - 🔑 Autenticação segura com Supabase Auth
  - 👤 Perfis personalizáveis
  - 🛡️ Row Level Security (RLS)
  - 🌍 Suporte a timezone

### 🎨 Interface e UX

- **Design Responsivo**
  - 📱 Otimizado para mobile e desktop
  - 🌙 Modo escuro/claro
  - ⌨️ Atalhos de teclado
  - 🎯 Navegação intuitiva

---

## 🛠️ Tecnologias

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|----------|
| **React** | 18.3.1 | Biblioteca para interfaces de usuário |
| **TypeScript** | 5.8.3 | Superset tipado do JavaScript |
| **Vite** | 5.4.19 | Build tool e dev server ultrarrápido |
| **Tailwind CSS** | 3.4.17 | Framework CSS utility-first |
| **shadcn/ui** | Latest | Componentes UI modernos e acessíveis |

### Estado e Dados

| Tecnologia | Versão | Descrição |
|------------|--------|----------|
| **Zustand** | 5.0.8 | Gerenciamento de estado simples e eficiente |
| **React Query** | 5.83.0 | Cache e sincronização de dados |
| **React Hook Form** | 7.61.1 | Formulários performáticos |
| **Zod** | 3.25.76 | Validação de schemas TypeScript |

### Backend e Infraestrutura

| Tecnologia | Versão | Descrição |
|------------|--------|----------|
| **Supabase** | 2.56.0 | Backend-as-a-Service completo |
| **PostgreSQL** | Latest | Banco de dados relacional |
| **Row Level Security** | - | Segurança a nível de linha |

### UI/UX e Acessibilidade

| Tecnologia | Versão | Descrição |
|------------|--------|----------|
| **Radix UI** | Latest | Primitivos acessíveis |
| **Lucide React** | 0.462.0 | Ícones modernos |
| **Framer Motion** | 12.23.12 | Animações fluidas |
| **Sonner** | 1.7.4 | Notificações elegantes |

---

## 🚀 Instalação

### Pré-requisitos

- **Node.js** 18+ 
- **npm** ou **pnpm**
- **Git**
- Conta no **Supabase**

### 1. Clone o Repositório

```bash
git clone https://github.com/joseemaarcos9-wq/pebble-tasks-99.git
cd pebble-tasks-99
```

### 2. Instale as Dependências

```bash
# Com npm
npm install

# Ou com pnpm (recomendado)
pnpm install
```

### 3. Configure as Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Execute o Projeto

```bash
# Modo desenvolvimento
npm run dev

# Ou com pnpm
pnpm dev
```

A aplicação estará disponível em `http://localhost:8080`

---

## ⚙️ Configuração

### Configuração do Supabase

1. **Crie um projeto no Supabase**
   - Acesse [supabase.com](https://supabase.com)
   - Crie um novo projeto
   - Anote a URL e a chave anônima

2. **Execute as Migrações**
   ```bash
   # Instale a CLI do Supabase
   npm install -g supabase
   
   # Faça login
   supabase login
   
   # Conecte ao projeto
   supabase link --project-ref SEU_PROJECT_ID
   
   # Execute as migrações
   supabase db push
   ```

3. **Configure a Autenticação**
   - No painel do Supabase, vá em Authentication > Settings
   - Configure os provedores de autenticação desejados
   - Adicione as URLs de redirecionamento

### Estrutura do Banco de Dados

O projeto utiliza as seguintes tabelas principais:

- **profiles**: Dados dos usuários
- **task_lists**: Listas de tarefas
- **tasks**: Tarefas individuais
- **subtasks**: Subtarefas
- **custom_views**: Visualizações personalizadas
- **finance_accounts**: Contas financeiras
- **finance_categories**: Categorias de transações
- **finance_transactions**: Transações financeiras
- **finance_tags**: Tags financeiras
- **finance_recurrences**: Transações recorrentes
- **finance_budgets**: Orçamentos

---

## 📱 Como Usar

### Primeiros Passos

1. **Cadastro/Login**
   - Acesse a aplicação
   - Crie uma conta ou faça login
   - Complete seu perfil

2. **Configuração Inicial**
   - Crie suas primeiras listas de tarefas
   - Configure suas contas financeiras
   - Personalize categorias e tags

### Gerenciamento de Tarefas

1. **Criando Tarefas**
   - Clique em "Nova Tarefa"
   - Preencha título, descrição e detalhes
   - Defina prioridade e data de vencimento
   - Adicione tags e links se necessário

2. **Organizando com Listas**
   - Crie listas temáticas (Trabalho, Pessoal, etc.)
   - Personalize cores para identificação visual
   - Use filtros para visualizações específicas

3. **Visualizações Personalizadas**
   - Crie views customizadas com filtros específicos
   - Salve combinações de filtros frequentes
   - Acesse rapidamente suas visualizações favoritas

### Controle Financeiro

1. **Configurando Contas**
   - Adicione suas contas bancárias, carteiras e cartões
   - Defina saldos iniciais
   - Personalize com cores para identificação

2. **Registrando Transações**
   - Registre receitas e despesas
   - Categorize adequadamente
   - Use tags para organização adicional
   - Configure transações recorrentes

3. **Acompanhando Orçamentos**
   - Defina orçamentos mensais por categoria
   - Monitore gastos em tempo real
   - Receba alertas de limite

### Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + N` | Nova tarefa |
| `Ctrl + F` | Buscar |
| `Ctrl + L` | Nova lista |
| `Esc` | Fechar modais |
| `Tab` | Navegar entre elementos |

---

## 🗂️ Estrutura do Projeto

```
pebble-tasks/
├── 📁 public/                    # Arquivos estáticos
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── 📁 src/                       # Código fonte principal
│   ├── 📁 components/            # Componentes React
│   │   ├── 📁 auth/              # Componentes de autenticação
│   │   ├── 📁 finance/           # Componentes financeiros
│   │   ├── 📁 providers/         # Provedores de contexto
│   │   ├── 📁 tasks/             # Componentes de tarefas
│   │   ├── 📁 ui/                # Componentes UI base (shadcn)
│   │   └── 📁 workspace/         # Componentes do workspace
│   ├── 📁 features/              # Features organizadas por domínio
│   │   ├── 📁 finance/           # Lógica de negócio financeira
│   │   ├── 📁 tasks/             # Lógica de negócio de tarefas
│   │   └── 📁 ui/                # Estado da interface
│   ├── 📁 hooks/                 # Hooks customizados
│   ├── 📁 integrations/          # Integrações externas
│   │   └── 📁 supabase/          # Cliente e tipos do Supabase
│   ├── 📁 lib/                   # Utilitários e configurações
│   ├── 📁 pages/                 # Páginas da aplicação
│   ├── 📁 types/                 # Definições de tipos TypeScript
│   ├── App.tsx                   # Componente raiz
│   ├── main.tsx                  # Ponto de entrada
│   └── index.css                 # Estilos globais
├── 📁 supabase/                  # Configurações do Supabase
│   ├── 📁 migrations/            # Migrações do banco de dados
│   └── config.toml               # Configuração do projeto
├── 📄 components.json            # Configuração do shadcn/ui
├── 📄 package.json               # Dependências e scripts
├── 📄 tailwind.config.ts         # Configuração do Tailwind
├── 📄 tsconfig.json              # Configuração do TypeScript
├── 📄 vite.config.ts             # Configuração do Vite
└── 📄 README.md                  # Este arquivo
```

### Arquitetura de Componentes

- **Atomic Design**: Componentes organizados hierarquicamente
- **Feature-Based**: Funcionalidades agrupadas por domínio
- **Separation of Concerns**: Lógica separada da apresentação
- **Reusabilidade**: Componentes reutilizáveis e configuráveis

---

## 🔗 API e Banco de Dados

### Esquema do Banco de Dados

#### Tabelas Principais

**Sistema de Usuários**
```sql
-- Perfis de usuário
profiles {
  id: UUID (PK, FK auth.users)
  full_name: TEXT
  avatar_url: TEXT
  timezone: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**Sistema de Tarefas**
```sql
-- Listas de tarefas
task_lists {
  id: UUID (PK)
  user_id: UUID (FK)
  name: TEXT
  color: TEXT
  created_at: TIMESTAMP
}

-- Tarefas
tasks {
  id: UUID (PK)
  user_id: UUID (FK)
  list_id: UUID (FK)
  title: TEXT
  description: TEXT
  priority: ENUM
  status: ENUM
  tags: TEXT[]
  due_date: TIMESTAMP
  completed_at: TIMESTAMP
  link: TEXT
  photos: TEXT[]
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**Sistema Financeiro**
```sql
-- Contas financeiras
finance_accounts {
  id: UUID (PK)
  user_id: UUID (FK)
  nome: TEXT
  tipo: ENUM
  saldo_inicial: DECIMAL
  moeda: TEXT
  cor: TEXT
  arquivada: BOOLEAN
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}

-- Transações
finance_transactions {
  id: UUID (PK)
  user_id: UUID (FK)
  conta_id: UUID (FK)
  categoria_id: UUID (FK)
  valor: DECIMAL
  tipo: ENUM
  descricao: TEXT
  tags: TEXT
  status: ENUM
  data: DATE
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### Políticas de Segurança (RLS)

Todas as tabelas implementam Row Level Security:

- **Isolamento por usuário**: Cada usuário acessa apenas seus dados
- **Políticas granulares**: Controle específico por operação (SELECT, INSERT, UPDATE, DELETE)
- **Segurança automática**: Aplicada automaticamente pelo Supabase

### APIs Disponíveis

#### Autenticação
- `supabase.auth.signUp()` - Registro de usuário
- `supabase.auth.signIn()` - Login
- `supabase.auth.signOut()` - Logout
- `supabase.auth.getUser()` - Usuário atual

#### Tarefas
- `GET /tasks` - Listar tarefas
- `POST /tasks` - Criar tarefa
- `PUT /tasks/:id` - Atualizar tarefa
- `DELETE /tasks/:id` - Excluir tarefa

#### Finanças
- `GET /finance_accounts` - Listar contas
- `POST /finance_transactions` - Criar transação
- `GET /finance_categories` - Listar categorias

---

## 🎨 Interface e Design

### Design System

- **Cores**: Paleta moderna e acessível
- **Tipografia**: Inter font para legibilidade
- **Espaçamento**: Sistema consistente baseado em 4px
- **Componentes**: shadcn/ui para consistência

### Responsividade

- **Mobile First**: Otimizado para dispositivos móveis
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Layout Flexível**: Grid e flexbox para adaptabilidade

### Acessibilidade

- **WCAG 2.1**: Conformidade com diretrizes de acessibilidade
- **Navegação por Teclado**: Suporte completo
- **Screen Readers**: Compatibilidade com leitores de tela
- **Contraste**: Cores com contraste adequado

### Temas

- **Modo Claro/Escuro**: Alternância automática ou manual
- **Persistência**: Preferência salva localmente
- **Variáveis CSS**: Sistema de cores dinâmico

---

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conecte o Repositório**
   ```bash
   # Instale a CLI da Vercel
   npm install -g vercel
   
   # Faça deploy
   vercel
   ```

2. **Configure as Variáveis de Ambiente**
   - No painel da Vercel, vá em Settings > Environment Variables
   - Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

3. **Deploy Automático**
   - Conecte o repositório GitHub
   - Deploys automáticos a cada push na main

### Netlify

1. **Build Settings**
   ```bash
   # Build command
   npm run build
   
   # Publish directory
   dist
   ```

2. **Variáveis de Ambiente**
   - Configure no painel do Netlify
   - Site Settings > Environment Variables

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8080
CMD ["npm", "run", "preview"]
```

### Scripts Disponíveis

```json
{
  "scripts": {
    "dev": "vite",                    // Servidor de desenvolvimento
    "build": "vite build",           // Build para produção
    "build:dev": "vite build --mode development", // Build de desenvolvimento
    "preview": "vite preview",       // Preview do build
    "lint": "eslint ."               // Verificação de código
  }
}
```

---

## 🤝 Contribuição

### Como Contribuir

1. **Fork o Projeto**
   ```bash
   git clone https://github.com/seu-usuario/pebble-tasks-99.git
   ```

2. **Crie uma Branch**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

3. **Faça suas Alterações**
   - Siga os padrões de código estabelecidos
   - Adicione testes se necessário
   - Documente mudanças significativas

4. **Commit suas Mudanças**
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```

5. **Push para a Branch**
   ```bash
   git push origin feature/nova-funcionalidade
   ```

6. **Abra um Pull Request**
   - Descreva as mudanças realizadas
   - Inclua screenshots se aplicável
   - Referencie issues relacionadas

### Padrões de Código

- **ESLint**: Configuração rigorosa para qualidade
- **TypeScript**: Tipagem forte obrigatória
- **Prettier**: Formatação automática
- **Conventional Commits**: Padrão de mensagens de commit

### Estrutura de Commits

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

### Reportando Bugs

1. **Verifique Issues Existentes**
2. **Crie uma Issue Detalhada**
   - Descreva o problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots/logs se aplicável

### Sugerindo Funcionalidades

1. **Abra uma Issue de Feature Request**
2. **Descreva a Funcionalidade**
   - Problema que resolve
   - Solução proposta
   - Alternativas consideradas

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2024 José Marcos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  <h3>🚀 Desenvolvido com ❤️ por José Marcos</h3>
  <p>Se este projeto foi útil para você, considere dar uma ⭐!</p>
  
  <a href="https://github.com/joseemaarcos9-wq/pebble-tasks-99/issues">Reportar Bug</a> ·
  <a href="https://github.com/joseemaarcos9-wq/pebble-tasks-99/issues">Solicitar Feature</a> ·
  <a href="https://github.com/joseemaarcos9-wq/pebble-tasks-99/discussions">Discussões</a>
</div>

---

### 📊 Status do Projeto

- ✅ **Sistema de Tarefas**: Completo e funcional
- ✅ **Sistema Financeiro**: Implementado com todas as funcionalidades
- ✅ **Autenticação**: Segura com Supabase Auth
- ✅ **Interface Responsiva**: Otimizada para todos os dispositivos
- ✅ **Banco de Dados**: Estrutura robusta com RLS
- 🔄 **Melhorias Contínuas**: Sempre evoluindo

### 🔮 Próximas Funcionalidades

- 📊 Relatórios e gráficos avançados
- 🔔 Notificações push
- 📱 Aplicativo mobile nativo
- 🤖 Integração com IA para sugestões
- 🔄 Sincronização offline
- 🌐 Suporte a múltiplos idiomas

---

**Última atualização**: Janeiro 2025
