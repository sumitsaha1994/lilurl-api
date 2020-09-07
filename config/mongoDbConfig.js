const { connect, connection } = require("mongoose");

connect(process.env.MONGO_DB_KEY, { useNewUrlParser: true });

const conn = connection;
conn.on("error", console.error.bind(console, "Mongodb connection error:"));
conn.once("open", function () {
    console.log("Mongodb connection established");
});
