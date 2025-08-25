# Pebble Tasks 99

Sistema de gerenciamento de tarefas desenvolvido com Node.js, Express e MongoDB.

## 🚀 Funcionalidades

- ✅ Autenticação de usuários (registro e login)
- ✅ CRUD completo de tarefas
- ✅ Sistema de prioridades (baixa, média, alta)
- ✅ Status de tarefas (pendente, em progresso, concluída)
- ✅ Filtros por status e prioridade
- ✅ Paginação de resultados
- ✅ Autenticação JWT
- ✅ Validação de dados
- ✅ Middleware de segurança

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **CORS** - Controle de acesso
- **dotenv** - Variáveis de ambiente

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd pebble-tasks-99
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pebble-tasks
JWT_SECRET=seu_jwt_secret_aqui_mude_em_producao
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

5. Inicie o MongoDB (se estiver usando localmente)

6. Execute o projeto:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📚 API Endpoints

### Autenticação

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Obter perfil (autenticado)
- `PUT /api/auth/profile` - Atualizar perfil (autenticado)

### Tarefas

- `GET /api/tasks` - Listar tarefas
- `GET /api/tasks/:id` - Obter tarefa por ID
- `POST /api/tasks` - Criar tarefa (autenticado)
- `PUT /api/tasks/:id` - Atualizar tarefa (autenticado)
- `DELETE /api/tasks/:id` - Deletar tarefa (autenticado)

### Outros

- `GET /health` - Health check
- `GET /` - Informações da API

## 📝 Exemplos de Uso

### Registrar usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "123456"
  }'
```

### Criar tarefa
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "title": "Minha primeira tarefa",
    "description": "Descrição da tarefa",
    "priority": "high",
    "dueDate": "2024-12-31"
  }'
```

## 🗂️ Estrutura do Projeto

```
pebble-tasks-99/
├── config/
│   └── database.js          # Configuração do MongoDB
├── controllers/
│   ├── authController.js    # Controlador de autenticação
│   └── taskController.js    # Controlador de tarefas
├── middleware/
│   └── auth.js              # Middleware de autenticação
├── models/
│   ├── Task.js              # Modelo de tarefa
│   └── User.js              # Modelo de usuário
├── routes/
│   ├── authRoutes.js        # Rotas de autenticação
│   └── taskRoutes.js        # Rotas de tarefas
├── .env                     # Variáveis de ambiente
├── .env.example             # Exemplo de variáveis
├── index.js                 # Arquivo principal
├── package.json             # Dependências e scripts
└── README.md                # Documentação
```

## 🔒 Segurança

- Senhas são hasheadas com bcrypt
- Autenticação via JWT
- Validação de dados de entrada
- CORS configurado
- Middleware de tratamento de erros

## 🚀 Deploy

Para fazer deploy em produção:

1. Configure as variáveis de ambiente de produção
2. Use um banco MongoDB em nuvem (MongoDB Atlas)
3. Configure um JWT_SECRET forte
4. Execute: `npm start`

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.