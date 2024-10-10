import mysql from 'mysql2/promise'

const connection = mysql.createPool({
    host: 'sukabumi.karixa.co.id',
    user: 'nimda',
    password: 'B0r0k0k0K_',
    database: 'bes_medical'
});

connection.getConnection()
.then(() => {
    console.log('Database connected successfully');
})
.catch(err => {
    console.log('Database connection failed');
    console.log(err);
});

export default connection;