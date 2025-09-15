import { Request, Response } from "express";
import connection from "../Config/db";
import { RowDataPacket } from "mysql2";
import { CashRequest } from "../Interfaces/main";
import moment from 'moment-timezone';
import connSarandi from "../Config/dbSarandi";
import connAcc from "../Config/dbAcc";

export const MainController = async (req: Request, res: Response) => {
    const { selectedTipe, selectedAll, selectedCheckbox, action } = req.body;

    try {
        
        const date = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

        let where = "";
        if(selectedTipe === '1'){
            let tipe = "(cash_request.acc_po = '0' OR cash_request.acc_po IS NULL)";
            if(selectedTipe === '1'){
                tipe = "cash_request.acc_po = '1'";
            }

            let all = "AND cash_request.`status` = '1'";
            if(selectedAll === '1'){
                all = "AND (cash_request.`status` = '1' OR cash_request.`status` = '3')";
            }

            where = 
            `WHERE ${tipe} ${all}
            AND YEAR(tgl) > '2023'`
        } else {
            let all = "cash_request.`status` = '1'";
            if(selectedAll === '1'){
                all = "(cash_request.`status` = '1' OR cash_request.`status` = '3')";
            }

            where = 
            `WHERE ${all}
            AND YEAR(tgl) > '2023'
            AND appr_person = '72987'`
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
			${where}
            ORDER BY cash_request.duedate, cash_request.id_cash`
        );

        const castReqList = (rowCastReq as CashRequest[]).map((item: CashRequest) => {
            return {
                ...item
            }
        });

        let newStatus = action === "reject" ? "6" : "3";
        
        for (const id of selectedCheckbox) {
            await connection.query<RowDataPacket[]>(
                `UPDATE cash_request 
                SET status = ?,
                appr_date = ? 
                WHERE id_cash = ?`, [newStatus, date, id]
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

interface Saldo {
    saldo: number | string | null;
}

const getSaldoAkhir = async (tgl1: string, tgl2: string, norek: string) => {
    const [cekSaldoAwal] = await connAcc.query<RowDataPacket[]>(
        `SELECT saldo FROM saldo_real WHERE noacc = ?`,[norek]
    );
    const saldoAwal = cekSaldoAwal[0] as Saldo;

    const [cekBank] = await connection.query<RowDataPacket[]>(
        `SELECT SUM(jumlah) as saldo
        FROM cash_request 
        WHERE DATE(cash_request.duedate) BETWEEN ? AND ?
        AND cash_request.bank_kredit = ?
        AND cash_request.status = '5'
        AND (cash_request.paid_date <> '1970-01-01 00:00:00' 
        OR cash_request.paid_date <> '0000-00-00 00:00:00')
        AND saldo_masuk = '0'`,
        [tgl1, tgl2, norek]
    );
    const saldoBank = cekBank[0] as Saldo;

    const [cekTambahSaldo] = await connection.query<RowDataPacket[]>(
        `SELECT SUM(cash_request.jumlah) as saldo 
        FROM cash_request 
        WHERE DATE(cash_request.duedate) BETWEEN ? AND ?
        AND cash_request.pindah_debet = ?
        AND cash_request.status = '5'`,
        [tgl1, tgl2, norek]
    );
    const tambahSaldo = cekTambahSaldo[0] as Saldo;

    const [cekKurangSaldo] = await connection.query<RowDataPacket[]>(
        `SELECT SUM(cash_request.jumlah) as saldo 
        FROM cash_request 
        WHERE DATE(cash_request.duedate) BETWEEN ? AND ?
        AND cash_request.pindah_kredit = ?
        AND cash_request.status = '5'`,
        [tgl1, tgl2, norek]
    );
    const kurangSaldo = cekKurangSaldo[0] as Saldo;

    const [cekSaldoMasuk] = await connection.query<RowDataPacket[]>(
        `SELECT SUM(saldo_masuk) AS saldo 
        FROM cash_request 
        WHERE DATE(cash_request.duedate) BETWEEN ? AND ? 
        AND cash_request.bank_kredit = ?
        AND cash_request.status = '5'
        AND saldo_masuk <> '0'`,
        [tgl1, tgl2, norek]
    );
    const saldoMasuk = cekSaldoMasuk[0] as Saldo;
    
    const saldoAkhir = Number(saldoAwal.saldo) + Number(saldoMasuk.saldo) + Number(tambahSaldo.saldo) - Number(kurangSaldo.saldo) - Number(saldoBank.saldo);

    return saldoAkhir;
}

export const GetSaldoController = async (req: Request, res: Response) => {

    try {
        const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT
            cash_request.tgl,
            cash_request.duedate
            FROM
            cash_request
            ORDER BY 
            cash_request.duedate ASC
            LIMIT 1`
        );
        const getDate1 = rows[0] as {duedate: string}
        const tgl1 = getDate1.duedate;

        const [rows2] = await connection.query<RowDataPacket[]>(
            `SELECT
            cash_request.tgl,
            cash_request.duedate
            FROM
            cash_request
            ORDER BY 
            cash_request.duedate DESC
            LIMIT 1`
        );
        const getDate2 = rows2[0] as {duedate: string}
        const tgl2 = getDate2.duedate;

        console.log("Tanggal 1: ", tgl1);
        console.log("Tanggal 2: ", tgl2);

        const saldoMandiri = await getSaldoAkhir(tgl1, tgl2, '111030');
        const saldoBca = await getSaldoAkhir(tgl1, tgl2, '111016');
        const saldoKas = await getSaldoAkhir(tgl1, tgl2, '111002');

        res.status(200).json({
            saldoMandiri,
            saldoBca,
            saldoKas
        });
    } catch (error) {
        res.status(500).json({ message: `An error occurred on the server` })
    }
}