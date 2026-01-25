import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';
import rootRoutes from './routes/index.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

app.use(express.json());

app.get('/', async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    res.json({ message: 'Kết nối thành công!', data: result });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi kết nối DB' });
  }
});

app.use('/api', rootRoutes);

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});
