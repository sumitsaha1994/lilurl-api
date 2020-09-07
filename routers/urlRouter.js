const express = require("express");
const urlRouter = express.Router();
const {
    addUrlPost,
    getShortUrlByMainUrl,
    getMainUrlByShortUrl,
    getAllUrls,
    getAliasUrls,
    getUrlCountLastFiveMonths,
    getUrlCountLastSevenDays,
} = require("../controllers/urlController");
const auth = require("../middlewares/auth");

urlRouter
    .get("/getShortUrlByMainUrl/:url", getShortUrlByMainUrl)
    .get("/getMainUrlByShortUrl/:url", auth, getMainUrlByShortUrl)
    .get("/getUrlCountLastFiveMonths", auth, getUrlCountLastFiveMonths)
    .get("/getUrlCountLastSevenDays", auth, getUrlCountLastSevenDays)
    .get("/getAllUrls", auth, getAllUrls)
    .get("/getAliasUrls", auth, getAliasUrls)
    .post("/addurl", auth, addUrlPost);

module.exports = urlRouter;
