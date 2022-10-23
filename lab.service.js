const Laboratory = require("@moleculer/lab");

module.exports = {
    mixins: [Laboratory.AgentService],
    settings: {
        token: process.env.TOKEN,
        apiKey: process.env.API_KEY
    }
};
