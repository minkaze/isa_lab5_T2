const config = require("./config");
const Database = require("./Database");
const ApiServer = require("./ApiServer");

const database = new Database(config.db);
const apiServer = new ApiServer(config, database);
apiServer.start();
