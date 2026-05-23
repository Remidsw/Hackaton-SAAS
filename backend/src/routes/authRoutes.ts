import { Router } from 'express';
import { login, register, forgotPassword, resetPassword, verifyEmail, resendCode, getProfile, deleteAccount } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendCode);

// Routes protégées
router.get('/profile', authMiddleware, getProfile);
router.delete('/delete-account', authMiddleware, deleteAccount);

export default router;
