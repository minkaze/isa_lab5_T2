const mysql = require("mysql2/promise");

class Database {
    constructor(dbConfig) {
        this.readPool = this.createPool(dbConfig, dbConfig.reader);
        this.writePool = this.createPool(dbConfig, dbConfig.writer);
    }

    createPool(dbConfig, credentials) {
        return mysql.createPool({
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.database,
            user: credentials.user,
            password: credentials.password,
            waitForConnections: true,
            connectionLimit: 5,
            dateStrings: true,
            multipleStatements: false,
            ssl: dbConfig.ssl
                ? { minVersion: "TLSv1.2", rejectUnauthorized: dbConfig.sslStrict }
                : undefined
        });
    }

    async ensureTable() {
        await this.writePool.query(
            `CREATE TABLE IF NOT EXISTS patient (
                patientid INT(11) NOT NULL AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                dateOfBirth DATETIME NOT NULL,
                PRIMARY KEY (patientid)
            ) ENGINE=InnoDB`
        );
    }

    async insertDefaultPatients() {
        await this.ensureTable();
        const [result] = await this.writePool.query(
            "INSERT INTO patient (name, dateOfBirth) VALUES ?",
            [[
                ["Sara Brown", "1901-01-01"],
                ["John Smith", "1941-01-01"],
                ["Jack Ma", "1961-01-30"],
                ["Elon Musk", "1999-01-01"]
            ]]
        );
        return result;
    }

    async runInsert(sql) {
        await this.ensureTable();
        const [result] = await this.writePool.query(sql);
        return result;
    }

    async runSelect(sql) {
        const [rows] = await this.readPool.query(sql);
        return rows;
    }

    async close() {
        await Promise.all([this.readPool.end(), this.writePool.end()]);
    }
}

module.exports = Database;
