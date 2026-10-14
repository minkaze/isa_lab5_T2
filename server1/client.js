const API_BASE_URL = "https://your-server2-domain.example";

class PatientAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async insertPatients() {
        const response = await fetch(
            `${this.baseURL}/lab5/api/v1/patients`,
            {
                method: "POST"
            }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(
                `${MESSAGES.HTTP_ERROR} ${response.status} ${result}`
            );
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
            throw new Error(
                `${MESSAGES.HTTP_ERROR} ${response.status} ${result}`
            );
        }

        return result;
    }

}

class PatientUI {
    constructor() {
        this.pageTitle = document.getElementById("pageTitle");
        this.insertButton = document.getElementById("insertButton");
        this.queryLabel = document.getElementById("queryLabel");
        this.sqlQuery = document.getElementById("sqlQuery");
        this.submitButton = document.getElementById("submitButton");
        this.responseTitle = document.getElementById("responseTitle");
        this.responseOutput = document.getElementById("responseOutput");

        this.api = new PatientAPI();

        this.initialize();
    }

    initialize() {
        this.pageTitle.textContent = MESSAGES.PAGE_TITLE;
        this.insertButton.textContent = MESSAGES.INSERT_BUTTON;
        this.queryLabel.textContent = MESSAGES.QUERY_LABEL;
        this.submitButton.textContent = MESSAGES.SUBMIT_BUTTON;
        this.responseTitle.textContent = MESSAGES.RESPONSE_TITLE;

        this.sqlQuery.value = MESSAGES.DEFAULT_QUERY;
        this.responseOutput.textContent = MESSAGES.WELCOME;

        this.insertButton.addEventListener("click", () => {
            this.handleInsert();
        });

        this.submitButton.addEventListener("click", () => {
            this.handleSubmit();
        });
    }

    renderResponse(result) {
        if (!result || result.trim() === "") {
            this.responseOutput.textContent = MESSAGES.EMPTY_RESPONSE;
            return;
        }

        let data;

        try {
            data = JSON.parse(result);
        } catch (error) {
            this.responseOutput.textContent = result;
            return;
        }

        let rows = null;

        if (Array.isArray(data)) {
            rows = data;
        } else if (data && typeof data === "object") {
            rows = data.rows || data.data || data.results;
        }

        if (Array.isArray(rows)) {
            this.displayTable(rows);
        } else if (data && typeof data === "object") {
            this.responseOutput.textContent =
                data.message || JSON.stringify(data, null, 2);
        } else {
            this.responseOutput.textContent = String(data);
        }
    }

    displayTable(rows) {
        this.responseOutput.replaceChildren();

        if (rows.length === 0) {
            this.responseOutput.textContent = MESSAGES.NO_RESULTS;
            return;
        }

        const columns = Object.keys(rows[0]);

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        for (const column of columns) {
            const th = document.createElement("th");
            th.textContent = column;
            headerRow.appendChild(th);
        }

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        for (const row of rows) {
            const tr = document.createElement("tr");

            for (const column of columns) {
                const td = document.createElement("td");
                const value = row[column];

                td.textContent = value === null || value === undefined
                    ? MESSAGES.EMPTY_VALUE
                    : String(value);

                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        }

        table.appendChild(tbody);
        this.responseOutput.appendChild(table);
    }

    async handleInsert() {
        this.insertButton.disabled = true;
        this.responseOutput.textContent = MESSAGES.INSERTING;

        try {
            const result = await this.api.insertPatients();
            this.renderResponse(result);
        } catch (error) {
            this.responseOutput.textContent =
                `${MESSAGES.REQUEST_FAILED} ${error.message}`;
        } finally {
            this.insertButton.disabled = false;
        }
    }

    async handleSubmit() {
        const query = this.sqlQuery.value.trim();

        if (query === "") {
            this.responseOutput.textContent = MESSAGES.EMPTY_QUERY;
            return;
        }

        this.submitButton.disabled = true;
        this.responseOutput.textContent = MESSAGES.QUERYING;

        try {
            const result = await this.api.executeQuery(query);

            this.renderResponse(result);

        } catch (error) {
            this.responseOutput.textContent =
                `${MESSAGES.REQUEST_FAILED} ${error.message}`;

        } finally {
            this.submitButton.disabled = false;
        }
    }

}

const patientUI = new PatientUI();
