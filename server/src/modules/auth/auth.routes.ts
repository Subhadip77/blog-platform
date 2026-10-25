import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authLimiter, refreshLimiter } from '../../middleware/rateLimiter';
import { authController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.post('/refresh', refreshLimiter, authController.refresh);
router.post('/logout', authController.logout);

export default router;