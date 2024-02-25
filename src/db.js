const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "lolyz0ok3stvj6f0.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "xglumvigvg1d8rid",
    password: "kaz6104uner10fg4",
    database: "bnnbiw8lldekb1ot",
  },
});

module.exports = knex;
