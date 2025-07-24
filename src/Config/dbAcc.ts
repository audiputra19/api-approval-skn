import mysql from 'mysql2/promise'

const connAcc = mysql.createPool({
    host: process.env.DB_HOST,
    user: 'nimda',
    password: process.env.DB_PASS,
    database: 'acc'
});

connAcc.getConnection()
.then(() => {
    console.log('Database Acc connected successfully');
})
.catch(err => {
    console.log('Database Acc connection failed');
    console.log(err);
});

export default connAcc;