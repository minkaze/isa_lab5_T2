
class PatientUI {
    constructor() {
        this.pageTitle = document.getElementById("pageTitle");
        this.insertButton = document.getElementById("insertButton");
        this.queryLabel = document.getElementById("queryLabel");
        this.sqlQuery = document.getElementById("sqlQuery");
        this.submitButton = document.getElementById("submitButton");
        this.responseTitle = document.getElementById("responseTitle");
        this.responseOutput = document.getElementById("responseOutput");

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

    handleInsert() {
        this.responseOutput.textContent = MESSAGES.INSERT_CLICKED;
    }

    handleSubmit() {
        const query = this.sqlQuery.value.trim();

        if (query === "") {
            this.responseOutput.textContent = MESSAGES.EMPTY_QUERY;
            return;
        }

        this.responseOutput.textContent = MESSAGES.SUBMIT_CLICKED;
    }
}

const patientUI = new PatientUI();
