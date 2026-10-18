
const API_BASE_URL = "https://d17weg2w58w5x2.cloudfront.net";

class PatientAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async insertPatients() {
        const response = await fetch(`${this.baseURL}/lab5/api/v1/patients`, {method: "POST"});

        const result = await response.text();

        if (!response.ok) {
            throw new Error(this.formatError(response.status, result));
        }

        return result || MESSAGES.INSERT_SUCCESS;
    }

    async executeQuery(query) {
        const encodedQuery = encodeURIComponent(query);

        const url = `${this.baseURL}/lab5/api/v1/sql/${encodedQuery}`;

        const response = await fetch(url, {
            method: "GET"
        });

        const result = await response.text();

        if (!response.ok) {
            throw new Error(this.formatError(response.status, result));
        }

        return result;
    }

    formatError(status, body) {
        let detail = body;

        try {
            const parsed = JSON.parse(body);

            if (parsed && parsed.message) {
                detail = parsed.message;
            }
        } catch (error) {
            detail = body;
        }

        return `${MESSAGES.HTTP_ERROR} ${status} ${detail}`;
    }
}
