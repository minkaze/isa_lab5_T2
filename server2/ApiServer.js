// Claude was used
const http = require("http");
const messages = require("./lang/en/messages");

class ApiServer {
    constructor(config, database) {
        this.config = config;
        this.database = database;
        this.server = http.createServer((req, res) => this.handle(req, res));
    }

    start() {
        this.server.listen(this.config.port, () => {
            console.log(messages.serverStarted + this.config.port);
        });
    }

    setCors(res) {
        res.setHeader("Access-Control-Allow-Origin", this.config.allowedOrigin);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    sendJson(res, status, payload) {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(payload));
    }

    async handle(req, res) {
        this.setCors(res);
        try {
            if (req.method === "OPTIONS") {
                res.writeHead(204);
                res.end();
                return;
            }

            const url = new URL(req.url, "http://localhost");
            const markerIndex = url.pathname.indexOf(this.config.apiMarker);
            const isPatientsRoute = url.pathname.indexOf(this.config.patientsMarker) !== -1;
            if (markerIndex === -1 && !isPatientsRoute) {
                this.sendJson(res, 404, { success: false, message: messages.notFound });
                return;
            }

            if (req.method === "GET" && markerIndex !== -1) {
                const rest = url.pathname.slice(markerIndex + this.config.apiMarker.length);
                await this.handleGet(res, rest);
            } else if (req.method === "POST") {
                await this.handlePost(req, res);
            } else if (req.method === "GET") {
                this.sendJson(res, 404, { success: false, message: messages.notFound });
            } else {
                this.sendJson(res, 405, { success: false, message: messages.methodNotAllowed });
            }
        } catch (err) {
            this.handleError(res, err);
        }
    }

    async handleGet(res, rest) {
        let query;
        try {
            query = decodeURIComponent(rest.slice(1)).trim();
        } catch (e) {
            this.sendJson(res, 400, { success: false, message: messages.badUrlEncoding });
            return;
        }
        if (query.length >= 2 && query.startsWith("\"") && query.endsWith("\"")) {
            query = query.slice(1, -1).trim();
        }
        if (!query) {
            this.sendJson(res, 400, { success: false, message: messages.emptyQuery });
            return;
        }
        const rows = await this.database.runSelect(query);
        this.sendJson(res, 200, { success: true, message: messages.selectSuccess, rows });
    }

    async handlePost(req, res) {
        const body = await this.readBody(req);
        let parsed = {};
        if (body.trim()) {
            try {
                parsed = JSON.parse(body);
            } catch (e) {
                this.sendJson(res, 400, { success: false, message: messages.invalidJson });
                return;
            }
        }

        if (parsed.query) {
            const query = String(parsed.query).trim();
            if (!/^insert\b/i.test(query)) {
                this.sendJson(res, 403, { success: false, message: messages.onlyInsertAllowed });
                return;
            }
            const result = await this.database.runInsert(query);
            this.sendJson(res, 200, {
                success: true,
                message: messages.insertCustomSuccess,
                affectedRows: result.affectedRows
            });
            return;
        }

        const result = await this.database.insertDefaultPatients();
        this.sendJson(res, 200, {
            success: true,
            message: messages.insertSuccess,
            affectedRows: result.affectedRows
        });
    }

    readBody(req) {
        return new Promise((resolve, reject) => {
            let data = "";
            req.on("data", (chunk) => {
                data += chunk;
                if (data.length > this.config.maxBodyBytes) {
                    const err = new Error(messages.bodyTooLarge);
                    err.status = 413;
                    req.destroy();
                    reject(err);
                }
            });
            req.on("end", () => resolve(data));
            req.on("error", reject);
        });
    }

    handleError(res, err) {
        if (res.headersSent) {
            return;
        }
        if (err.status) {
            this.sendJson(res, err.status, { success: false, message: err.message });
        } else if (err.code || err.sqlMessage) {
            this.sendJson(res, 400, {
                success: false,
                message: messages.dbError + (err.sqlMessage || err.message)
            });
        } else {
            console.error(err);
            this.sendJson(res, 500, { success: false, message: messages.serverError });
        }
    }
}

module.exports = ApiServer;
