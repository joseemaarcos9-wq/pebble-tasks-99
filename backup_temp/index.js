import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Configurar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

// Criar aplicação Express
const app = express();

// Middlewares globais
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de log para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Rota para página inicial
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo ao Pebble Tasks API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      health: '/health'
    }
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Configurar porta e iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API Docs: http://localhost:${PORT}/`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app;