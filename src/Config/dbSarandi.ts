import mysql from 'mysql2/promise'

const connSarandi = mysql.createPool({
    host: process.env.DB_HOST,
    user: 'nimda',
    password: process.env.DB_PASS,
    database: 'sarandi_dbo'
});

connSarandi.getConnection()
.then(() => {
    console.log('Database sarandi connected successfully');
})
.catch(err => {
    console.log('Database sarandi connection failed');
    console.log(err);
});

export default connSarandi;