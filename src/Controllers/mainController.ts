import { Request, Response } from "express";
import connection from "../Config/db";
import { RowDataPacket } from "mysql2";
import { CashRequest } from "../Interfaces/main";
import moment from 'moment-timezone';

export const MainController = async (req: Request, res: Response) => {
    const { selectedComp, selectedAll, selectedCheckbox } = req.body;

    try {

        const date = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

        let comp = '0';
        if(selectedComp === '1'){
            comp = '1';
        }

        let all = "cash_request.`status` = '1'";
        if(selectedAll === '1'){
            all = "(cash_request.`status` = '1' OR cash_request.`status` = '3') AND paid_date IS NOT NULL";
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
			cash_request.status
			FROM
			cash_request
			INNER JOIN departemen ON cash_request.div_id = departemen.dept_id
			INNER JOIN karyawan ON cash_request.nik = karyawan.nik
			WHERE ${all}
			AND cash_request.utm = ?
            AND YEAR(tgl) > '2023'
            ORDER BY cash_request.duedate, cash_request.id_cash`, [comp]
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