import { NextFunction, Request, Response } from "express";

export const PinAccessMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { pin } = req.body;

    try {
        
        if (!pin) {
            res.status(400).json({ message: 'Pin must be filled in' });
            return;
        }

        if (pin.length !== 6) {
            res.status(400).json({ message: 'Pin must be 6 digits' });
            return;
        }
        
        next();

    } catch (error) {
        res.status(500).json({ message: 'An error occurred on the server' })
    }
}