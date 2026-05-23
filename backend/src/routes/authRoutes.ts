import { Router } from 'express';
import { login, register, forgotPassword, resetPassword, verifyEmail, resendCode } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendCode);

export default router;
