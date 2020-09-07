const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "./.env") });
require("./config/mongoDbConfig");
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const usersRouter = require("./routers/usersRouter");
const { handleError } = require("./util/errorHandler");
const urlRouter = require("./routers/urlRouter");
const app = express();
const cors = require("cors");

app.use(bodyParser.json());
app.use(cookieparser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        credentials: true,
    })
);

app.use("/api/users", usersRouter);
app.use("/api/url", urlRouter);
app.get("/", (req, res) => {
    res.status(200).send({ msg: "Hello world" });
});
app.use((req, res, next) => {
    handleError({ statusCode: 404, message: "not found" }, res);
});
app.use((err, req, res, next) => {
    console.log(err);
    if (res.headersSent) {
        return next(err);
    }
    if (err.statusCode) {
        handleError(err, res);
    } else {
        handleError({ statusCode: 500, message: "something went wrong" }, res);
    }
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`listening to port ${process.env.PORT || 5000}`);
});
