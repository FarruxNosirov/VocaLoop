import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import wordRoutes from './routes/word.routes';
import quizRoutes from './routes/quiz.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/quiz', quizRoutes);

app.get('/', (req, res) => {
  res.send('VocaLoop API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
