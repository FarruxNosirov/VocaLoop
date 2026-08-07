import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/quiz/results — foydalanuvchining barcha natijalari
router.get('/results', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const results = await prisma.quizResult.findMany({
      where: { userId: req.user!.id },
      select: {
        bookId: true, unitNum: true,
        correct: true, total: true, coins: true, completedAt: true,
      },
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Natijalarni olishda xato' });
  }
});

// POST /api/quiz/sync — qurilmadan natijalarni yuklash (upsert)
router.post('/sync', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { results } = req.body as {
      results: {
        bookId: string; unitNum: number;
        correct: number; total: number; coins: number; completedAt: string;
      }[];
    };

    if (!Array.isArray(results) || results.length === 0) {
      return res.json({ synced: 0 });
    }

    // Har birini upsert qilamiz (mavjud bo'lsa yangilaymiz, yo'q bo'lsa qo'shamiz)
    await Promise.all(
      results.map((r) =>
        prisma.quizResult.upsert({
          where: { userId_bookId_unitNum: { userId, bookId: r.bookId, unitNum: r.unitNum } },
          update: { correct: r.correct, total: r.total, coins: r.coins, completedAt: r.completedAt },
          create: { userId, bookId: r.bookId, unitNum: r.unitNum, correct: r.correct, total: r.total, coins: r.coins, completedAt: r.completedAt },
        })
      )
    );

    res.json({ synced: results.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sinxronlashda xato' });
  }
});

export default router;
