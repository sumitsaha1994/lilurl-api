const { validateToken } = require("../services/jwtService");
const { sendResponse } = require("../util/responseHandler");

const auth = (req, res, next) => {
    console.log(req.cookies);
    const token = req.cookies.userloggedin;

    const tokenData = validateToken(token, process.env.JWT_LOGIN_KEY);
    if (tokenData) {
        req.user = tokenData;
        next();
    } else {
        return sendResponse(401, { authorization: "unauthorized" }, res);
    }
};

module.exports = auth;
