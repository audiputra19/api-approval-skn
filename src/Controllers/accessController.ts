import { Request, Response } from "express";
import { GenerateToken } from "../Utils/generateToken";

export const AccessController = async (req: Request, res: Response) => {
    const { pin } = req.body;

    try {
        
        const generatePin = GenerateToken(pin);
        res.status(200).json({ 
            data : {
                token: generatePin, 
            },
            message: 'Pin Accepted'
        });
        return;

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
        return;
    }
}