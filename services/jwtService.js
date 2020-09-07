const jwt = require("jsonwebtoken");

exports.createToken = (payload, key, duration) => {
    return jwt.sign(payload, key, { expiresIn: duration });
};

exports.validateToken = (token, key) => {
    try {
        const data = jwt.verify(token, key);
        return data;
    } catch (e) {
        console.log(e);
        return false;
    }
};
