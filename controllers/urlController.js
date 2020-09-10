const shortid = require("shortid");
const { sendResponse } = require("../util/responseHandler");
const { ErrorHandler } = require("../util/errorHandler");
const URL = require("../models/urlModel");

exports.getShortUrlByMainUrl = async (req, res, next) => {
    try {
        const mainUrl = req.params.url;

        const doc = await URL.findOne({ main_url: mainUrl }).exec();
        sendResponse(200, { shortUrl: doc.short_url }, res);
    } catch (error) {
        next(error);
    }
};

exports.getMainUrlByShortUrl = async (req, res, next) => {
    try {
        const shortUrl = req.params.url;
        console.log(shortUrl);
        if (shortUrl) {
            const doc = await URL.findOne({ short_url: shortUrl }).exec();
            if (doc) {
                await URL.update({ _id: doc._id }, { $set: { click_count: doc.click_count + 1 } });
                sendResponse(200, { mainUrl: doc.main_url }, res);
            } else {
                throw new ErrorHandler(400, { getMainUrl: "invalid url request" });
            }
        } else {
            throw new ErrorHandler(400, { getMainUrl: "invalid url request" });
        }
    } catch (error) {
        next(error);
    }
};

exports.getAllUrls = async (req, res, next) => {
    try {
        // const authUser = req.user.userid;
        const docs = await URL.find({ alias: null }).exec();
        sendResponse(
            200,
            {
                urls: docs.map((doc) => ({
                    id: doc._id,
                    main_url: doc.main_url,
                    short_url: doc.short_url,
                    created_at: doc.created_at,
                    click_count: doc.click_count,
                })),
            },
            res
        );
    } catch (error) {
        next(error);
    }
};

exports.getAliasUrls = async (req, res, next) => {
    try {
        const authUser = req.user.userid;
        const docs = await URL.find({ alias: { $ne: null }, user_ids: authUser });
        sendResponse(
            200,
            {
                urls: docs.map((doc) => ({
                    id: doc._id,
                    main_url: doc.main_url,
                    short_url: doc.short_url,
                    created_at: doc.created_at,
                    click_count: doc.click_count,
                })),
            },
            res
        );
    } catch (error) {
        next(error);
    }
};

exports.getUrlCountLastFiveMonths = async (req, res, next) => {
    try {
        // const authUser = req.user.userid;
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        let searchDate = `${currentYear}-${currentMonth - 4}-2`;
        const docs = await URL.find({
            $and: [
                { created_at: { $lte: new Date() } },
                { created_at: { $gt: new Date(searchDate) } },
            ],
        });
        const urls = [];

        docs.map((doc) =>
            urls.push({
                id: doc._id,
                main_url: doc.main_url,
                short_url: doc.short_url,
                created_at: doc.created_at,
                click_count: doc.click_count,
            })
        );
        let urlCounts = [];
        let i = 0;
        while (i <= 4) {
            let month = (currentMonth - i + 12) % 12;
            urlCounts.push({
                month: month + 1,
                count: urls.filter((url) => url.created_at.getMonth() === month).length,
            });
            i++;
        }

        sendResponse(
            200,
            {
                urlCounts,
            },
            res
        );
    } catch (error) {
        next(error);
    }
};

exports.getUrlCountLastSevenDays = async (req, res, next) => {
    try {
        let currentDate = new Date();
        let searchDate = new Date();
        searchDate.setDate(currentDate.getDate() - 7);

        const docs = await URL.find({
            $and: [{ created_at: { $lte: currentDate } }, { created_at: { $gt: searchDate } }],
        });

        const urls = [];

        docs.map((doc) =>
            urls.push({
                id: doc._id,
                main_url: doc.main_url,
                short_url: doc.short_url,
                created_at: doc.created_at,
                click_count: doc.click_count,
            })
        );
        console.log(urls);
        let urlCounts = [];
        let urlIndex = 0;
        while (urlIndex <= 6) {
            let d;
            if (urlIndex == 0) {
                d = currentDate;
            } else {
                d = new Date();
                d.setDate(currentDate.getDate() - urlIndex);
            }

            urlCounts.push({
                day: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
                count: urls.filter((url) => {
                    let d1 = `${url.created_at.getFullYear()}-${
                        url.created_at.getMonth() + 1
                    }-${url.created_at.getDate()}`;

                    let d2 = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
                    return d1 === d2;
                }).length,
            });
            urlIndex++;
        }
        sendResponse(
            200,
            {
                urlCounts,
            },
            res
        );
    } catch (error) {
        next(error);
    }
};

exports.addUrlPost = async (req, res, next) => {
    try {
        const authUser = req.user.userid;
        console.log(req.body);
        const mainUrl = req.body.url;
        const alias = req.body.alias;
        console.log(alias);
        let shortUrl;
        if (mainUrl) {
            if (alias) {
                const doc = await URL.findOne({ alias: alias }).exec();
                if (doc) {
                    throw new ErrorHandler(400, { addUrl: "alias is not available." });
                } else {
                    const url = new URL({
                        user_ids: [authUser],
                        main_url: mainUrl,
                        short_url: alias,
                        alias: alias,
                    });
                    await url.save();
                    shortUrl = url.short_url;
                    sendResponse(
                        200,
                        {
                            addUrl: {
                                main_url: mainUrl,
                                short_url: shortUrl,
                            },
                        },
                        res
                    );
                }
            } else {
                const doc = await URL.findOne({ main_url: mainUrl, alias: null }).exec();
                if (doc == null) {
                    const url = new URL({
                        user_ids: [authUser],
                        main_url: mainUrl,
                        short_url: shortid.generate(),
                    });
                    await url.save();
                    shortUrl = url.short_url;
                } else {
                    if (!doc.user_ids.includes(authUser)) {
                        await URL.update(
                            { _id: doc._id },
                            { $set: { user_ids: doc.user_ids.concat(authUser) } }
                        );
                    }
                    shortUrl = doc.short_url;
                }
                sendResponse(
                    200,
                    {
                        addUrl: {
                            main_url: mainUrl,
                            short_url: shortUrl,
                        },
                    },
                    res
                );
            }
        } else {
            throw new ErrorHandler(400, { addUrl: "not a valid url" });
        }
    } catch (error) {
        next(error);
    }
};
