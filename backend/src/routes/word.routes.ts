import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { isShortText } from '../lib/validate';

const router = Router();

// GET /api/words — foydalanuvchining barcha so'zlari
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const words = await prisma.word.findMany({
      where: { userId: req.user!.id },
      select: {
        clientId: true, original: true, translated: true,
        time: true, date: true, fromLangCode: true, toLangCode: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(words);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "So'zlarni olishda xato" });
  }
});

// POST /api/words/sync — qurilmadagi so'zlarni yuklash (upsert, takrorlanmaydi)
router.post('/sync', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { words } = req.body as {
      words: {
        clientId: string; original: string; translated: string;
        time: string; date: string; fromLangCode?: string; toLangCode?: string;
      }[];
    };

    if (!Array.isArray(words)) {
      return res.status(400).json({ message: "words massiv bo'lishi kerak" });
    }
    if (words.length === 0) {
      return res.json({ synced: 0 });
    }
    if (words.length > 500) {
      return res.status(400).json({ message: "Bir so'rovda 500 tadan ko'p so'z bo'lmasin" });
    }
    const valid = words.every((w) =>
      isShortText(w?.clientId, 64) && isShortText(w?.original, 500) &&
      isShortText(w?.translated, 1000) && isShortText(w?.time, 16) &&
      typeof w?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(w.date)
    );
    if (!valid) {
      return res.status(400).json({ message: "So'z ma'lumoti noto'g'ri" });
    }

    await Promise.all(
      words.map((w) =>
        prisma.word.upsert({
          where: { userId_clientId: { userId, clientId: w.clientId } },
          update: {
            original: w.original, translated: w.translated,
            time: w.time, date: w.date,
            fromLangCode: w.fromLangCode ?? null,
            toLangCode: w.toLangCode ?? null,
          },
          create: {
            userId, clientId: w.clientId,
            original: w.original, translated: w.translated,
            time: w.time, date: w.date,
            fromLangCode: w.fromLangCode ?? null,
            toLangCode: w.toLangCode ?? null,
          },
        })
      )
    );

    res.json({ synced: words.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sinxronlashda xato' });
  }
});

// DELETE /api/words/:clientId — bitta so'zni o'chirish
router.delete('/:clientId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const clientId = String(req.params.clientId);
    await prisma.word.deleteMany({
      where: { userId: req.user!.id, clientId },
    });
    res.json({ message: "O'chirildi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "O'chirishda xato" });
  }
});

export default router;
