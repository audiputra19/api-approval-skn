import { NextFunction, Request, Response } from "express";

export const PinAccessMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { pin } = req.body;

    try {
        
        if (!pin) {
            res.status(400).json({ message: 'Pin harus diisi' });
            return;
        }

        if (pin.length !== 6) {
            res.status(400).json({ message: 'Pin harus 6 digit' });
            return;
        }

        if (pin !== '123456') {
            res.status(401).json({ message: 'Pin yang anda masukkan salah' });
            return;
        }
        
        next();

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' })
    }
}