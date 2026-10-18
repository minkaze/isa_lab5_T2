module.exports = {
    port: process.env.PORT || 3000,
    allowedOrigin: process.env.ALLOWED_ORIGIN || "*",
    apiMarker: "/api/v1/sql",
    patientsMarker: "/api/v1/patients",
    maxBodyBytes: 10000,
    db: {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        database: process.env.DB_NAME || "lab5",
        writer: {
            user: process.env.DB_WRITER_USER || "lab5_writer",
            password: process.env.DB_WRITER_PASSWORD || "change_me_writer"
        },
        reader: {
            user: process.env.DB_READER_USER || "lab5_reader",
            password: process.env.DB_READER_PASSWORD || "change_me_reader"
        }
    }
};
