import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/register', register);
router.post('/login', login);

// Rotas protegidas
router.use(authenticate); // Todas as rotas abaixo requerem autenticação

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;