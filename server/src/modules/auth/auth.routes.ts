import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authLimiter, refreshLimiter } from '../../middleware/rateLimiter';
import { authController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.get('/me', authenticate, authController.me);
router.post('/refresh', refreshLimiter, authController.refresh);
router.post('/logout', authController.logout);
router.get('/google', authLimiter, authController.socialStart('google'));
router.get('/google/callback', authLimiter, authController.socialCallback('google'));
router.get('/facebook', authLimiter, authController.socialStart('facebook'));
router.get('/facebook/callback', authLimiter, authController.socialCallback('facebook'));

export default router;