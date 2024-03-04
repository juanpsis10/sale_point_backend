const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "lgg2gx1ha7yp2w0k.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "gy9dc1scso3xb8nu",
    password: "pfqfyiblhdvapi40",
    database: "sef7yigzfi9x4jy8",
  },
});

module.exports = knex;
