import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';
import { validateName, validatePassword, validatePhone } from '../lib/validate';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

// Parolni taxmin qilib buzishning oldini olish: 15 daqiqada 10 ta urinish
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: "Juda ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring" },
});

router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body ?? {};

    const error = validatePhone(email) ?? validatePassword(password) ?? validateName(name);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const phone = String(email).trim();
    const existingUser = await prisma.user.findUnique({ where: { email: phone } });
    if (existingUser) {
      return res.status(400).json({ message: "Bu telefon raqam bilan hisob allaqachon mavjud" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: phone, password: hashedPassword, name: String(name).trim() },
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ro'yxatdan o'tishda server xatosi" });
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: "Telefon yoki parol noto'g'ri" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Telefon yoki parol noto'g'ri" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kirishda server xatosi' });
  }
});

export default router;
