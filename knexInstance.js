// knexInstance.js
const knex = require("knex");
const knexConfig = require("./knexfile");

const knexInstance = knex(knexConfig.development);

module.exports = knexInstance;
