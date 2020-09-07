exports.isEmpty = (string) => {
    if (string) {
        return string.trim() === "";
    } else {
        return true;
    }
};
exports.isPhoneNumber = (number) => number.trim().match(/^\d{10}$/);
exports.isEmail = (email) => {
    const regEx = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return email.match(regEx);
};
