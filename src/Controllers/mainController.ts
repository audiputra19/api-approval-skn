import { Request, Response } from "express";
import connection from "../Config/db";
import { RowDataPacket } from "mysql2";
import { CashRequest } from "../Interfaces/main";
import moment from 'moment-timezone';
import connSarandi from "../Config/dbSarandi";

export const MainController = async (req: Request, res: Response) => {
    const { selectedComp, selectedAll, selectedCheckbox } = req.body;

    try {

        const date = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

        let all = "cash_request.`status` = '1'";
        if(selectedAll === '1'){
            all = "(cash_request.`status` = '1' OR cash_request.`status` = '3')";
        }

        // console.log('selectedComp:', selectedComp)
        // console.log('comp:', comp);
        // console.log('all:', all);
        
        const [rowCastReq] = await connection.query<RowDataPacket[]>(
            `SELECT
			cash_request.id_cash,
			cash_request.duedate,
			cash_request.appr_date,
			cash_request.jumlah,
			cash_request.peruntukan,
			cash_request.penerima,
			cash_request.norek,
			cash_request.status,
            cash_request.referensi,
            divisi_pengajuan.divisi
			FROM
			cash_request
			INNER JOIN dt_karyawan ON cash_request.nik = dt_karyawan.ID_KAR
            INNER JOIN divisi_pengajuan ON cash_request.nik = divisi_pengajuan.kadiv
			WHERE ${all}
            AND YEAR(tgl) > '2023'
            ORDER BY cash_request.duedate, cash_request.id_cash`
        );

        const castReqList = (rowCastReq as CashRequest[]).map((item: CashRequest) => {
            return {
                ...item
            }
        });
        
        for (const id of selectedCheckbox) {
            await connection.query<RowDataPacket[]>(
                `UPDATE cash_request 
                SET status = '3',
                appr_date = ? 
                WHERE id_cash = ?`, [date, id]
            );
        }

        res.status(200).json({ 
            data: castReqList,
            message: 'Data saved successfully'
        });
        return;

    } catch (error) {
        res.status(500).json({ message: 'An error occurred on the server' });
        return;
    }
}

export const FileController = async (req: Request, res: Response) => {
    const {id} = req.body;

    try {
        const [rowCastFile] = await connection.query<RowDataPacket[]>(
            `SELECT * FROM cash_request_files WHERE id_cash = ?`, [id]
        );

        res.status(200).json(rowCastFile);

    } catch (error) {
        res.status(500).json({ message: 'An error occurred on the server' });
    }
}

export const ListPoKontrabon = async (req: Request, res: Response) => {
    const {noKontrabon} = req.body;

    try {
        const [rowKontrabon] = await connSarandi.query<RowDataPacket[]>(
            `SELECT nopo 
            FROM t_kontra_detail 
            WHERE id_bon = ?`, 
            [noKontrabon]
        );
        
        res.status(200).json(rowKontrabon);
    } catch (error) {
        res.status(500).json({ message: `An error occurred on the server` })
    }
}