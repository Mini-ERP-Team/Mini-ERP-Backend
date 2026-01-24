import express from 'express';
import { prisma } from './lib/prisma.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', async (req, res) => {
    try {
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        res.json({ message: "Kết nối thành công!", data: result });
    } catch (error) {
        res.status(500).json({ error: "Lỗi kết nối DB" });
    }
});

app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});