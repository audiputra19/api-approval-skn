import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express'
import accessRouter from './Routers/accessRouter';
import cors from 'cors';
import mainRouter from './Routers/mainRouter';
import changePinRouter from './Routers/changePinRouter';

const app = express();
app.use(express.json());

app.use(cors({
    // origin: 'http://localhost:3000',
    origin: 'https://approval-appskn.vercel.app',
}))

//endpoint untuk menjalankan access pin
app.use('/', accessRouter);

//endpoint untuk data utama
app.use('/', mainRouter);

//endpoint untuk ganti pin
app.use('/', changePinRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome');
});


const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
})