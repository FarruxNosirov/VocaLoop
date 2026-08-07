import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all words for the authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const words = await prisma.word.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(words);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching words' });
  }
});

// Sync (upload) words from mobile app
router.post('/sync', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { words } = req.body; // Array of { original, translated, time }

    if (!Array.isArray(words)) {
      return res.status(400).json({ message: 'Words must be an array' });
    }

    // Insert new words. A better approach for sync would be UPSERT, but for now we just insert.
    const createdWords = await prisma.$transaction(
      words.map(w =>
        prisma.word.create({
          data: {
            original: w.original,
            translated: w.translated,
            time: w.time,
            userId,
          },
        })
      )
    );

    res.status(201).json({ message: 'Words synced successfully', count: createdWords.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error syncing words' });
  }
});

export default router;
