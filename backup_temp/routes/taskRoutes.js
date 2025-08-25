import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas (com autenticação opcional)
router.get('/', optionalAuth, getTasks);
router.get('/:id', optionalAuth, getTaskById);

// Rotas protegidas (requerem autenticação)
router.use(authenticate); // Todas as rotas abaixo requerem autenticação

router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;