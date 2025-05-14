import { Request, Response } from "express";
import { GenerateToken } from "../Utils/generateToken";
import connection from "../Config/db";
import { RowDataPacket } from "mysql2";

export const AccessController = async (req: Request, res: Response) => {
    const { pin } = req.body;

    try {

        const [rowUser] = await connection.query<RowDataPacket[]>(
            `SELECT pin FROM users WHERE nip = ?`, ['30001']
        );

        const userPin = rowUser[0].pin;

        if(pin !== userPin){
            res.status(401).json({ message: 'Wrong pin' });
        }
        
        const generatePin = GenerateToken(pin);
        res.status(200).json({ 
            data : {
                token: generatePin, 
            },
            message: 'Pin Accepted'
        });
        return;

    } catch (error) {
        res.status(500).json({ message: 'An error occurred on the server' });
        return;
    }
}