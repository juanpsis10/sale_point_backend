const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "bvtpgx1a6ykkoaypyews-mysql.services.clever-cloud.com",
    user: "ujz6060i9a4igue9",
    password: "I3KPG9ceEv4frfeVlPAD",
    database: "bvtpgx1a6ykkoaypyews",
  },
});

module.exports = knex;
