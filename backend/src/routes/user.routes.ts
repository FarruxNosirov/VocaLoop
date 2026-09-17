import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { validateName, validatePassword, validatePhone } from '../lib/validate';

const router = Router();

const publicUser = { id: true, email: true, name: true, createdAt: true } as const;

// GET /api/user/profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: publicUser,
    });

    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Profilni olishda xato' });
  }
});

// PUT /api/user/profile — ism, telefon; parolni o'zgartirish uchun joriy parol shart
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, email, password, currentPassword } = req.body ?? {};

    const updateData: { name?: string; email?: string; password?: string } = {};

    if (name !== undefined) {
      const error = validateName(name);
      if (error) return res.status(400).json({ message: error });
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      const error = validatePhone(email);
      if (error) return res.status(400).json({ message: error });
      const phone = email.trim();
      const existingUser = await prisma.user.findUnique({ where: { email: phone } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Bu telefon raqam boshqa hisobda ishlatilgan' });
      }
      updateData.email = phone;
    }

    if (password !== undefined) {
      const error = validatePassword(password);
      if (error) return res.status(400).json({ message: error });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || typeof currentPassword !== 'string'
        || !(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(400).json({ message: "Joriy parol noto'g'ri" });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: publicUser,
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Profilni yangilashda xato' });
  }
});

// DELETE /api/user/profile — hisobni va unga tegishli barcha ma'lumotni o'chirish
router.delete('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { password } = req.body ?? {};

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    }
    if (typeof password !== 'string' || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Parol noto'g'ri" });
    }

    // Word va QuizResult "onDelete: Cascade" orqali birga o'chadi
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: "Hisob o'chirildi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hisobni o'chirishda xato" });
  }
});

export default router;
