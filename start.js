const { startAuthServer } = require("./auth/app");

startAuthServer(process.env.PORT || "4055");
