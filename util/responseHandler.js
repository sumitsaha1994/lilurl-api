exports.sendResponse = (statusCode, message, res) => {
    res.status(statusCode).json({
        status: "success",
        statusCode,
        message,
    });
};
