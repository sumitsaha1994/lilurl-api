const sequelize = require("sequelize");
console.log(process.env.DB_KEY);
const lilurlDB = new sequelize(process.env.DB_KEY);

lilurlDB
    .authenticate()
    .then(() => {
        console.log("Postgresql db connection successful");
    })
    .catch((err) => {
        console.log("Postgresql db connection failed", err);
    });

module.exports = lilurlDB;
