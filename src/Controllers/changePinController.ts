import { Request, Response } from "express";
import connection from "../Config/db";
import { RowDataPacket } from "mysql2";

export const ChangePinController = async (req: Request, res: Response) => {
    const { newPin } = req.body;

    try {
        await connection.query<RowDataPacket[]>(
            `UPDATE users SET pin = ? WHERE nip = '20002'`, [newPin]
        );

        res.status(200).json({ message: 'Pin changed successfully' });
        return;

    } catch (error) {
        res.status(500).json({ message: 'An error occurred on the server' });
        return;
    }
}