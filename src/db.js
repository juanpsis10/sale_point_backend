const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "b0ez1scklldr188uqggz-mysql.services.clever-cloud.com",
    user: "uxkta8xcrz31jle3",
    password: "BDQ0BpReOFv1rqSZNMmF",
    database: "b0ez1scklldr188uqggz",
  },
});

module.exports = knex;
