const { isEmpty, isEmail } = require("./common");
const User = require("../../models/userModel");
const { ErrorHandler } = require("../errorHandler");

exports.validateSignupData = async (data) => {
    let errors = {};
    console.log(data);
    if (isEmpty(data.email)) {
        errors.email = "Must not be empty";
    } else if (!isEmail(data.email)) {
        errors.email = "Must be a valid email address";
    } else {
        const findUser = await User.findOne({ where: { email: data.email } });
        if (findUser) {
            errors.email = "email already exists";
        }
    }

    if (isEmpty(data.password)) errors.password = "Must not be empty";
    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = "Passwords must match";
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.validateLoginData = (data) => {
    let errors = {};

    if (isEmpty(data.email)) {
        errors.email = "Must not be empty";
    } else if (!isEmail(data.email)) {
        errors.email = "Must be a valid email address";
    }
    if (isEmpty(data.password)) errors.password = "Must not be empty";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.validateForgotPasswordData = async (data) => {
    let errors = {};

    if (isEmpty(data.email)) {
        errors.email = "Must not be empty";
    } else if (!isEmail(data.email)) {
        errors.email = "Must be a valid email address";
    } else {
        const findUser = await User.findOne({ where: { email: data.email } });
        if (findUser === null) {
            errors.email = "invalid user";
        } else {
            const tokenFromDB = findUser.passwordResetToken;
            if (data.token !== tokenFromDB) {
                errors.token = "invalid token";
            }
        }
    }

    if (isEmpty(data.password)) errors.password = "Must not be empty";
    if (data.password !== data.confirmPassword) errors.confirmPassword = "Passwords must match";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.validatePasswordResetData = async (data) => {
    let errors = {};
    console.log(data);
    if (isEmpty(data.email)) {
        errors.email = "Must not be empty";
    } else if (!isEmail(data.email)) {
        errors.email = "Must be a valid email address";
    } else {
        const findUser = await User.findOne({ where: { email: data.email } });
        if (findUser === null) {
            errors.email = "invalid user email";
        }
    }

    if (isEmpty(data.password)) errors.password = "Must not be empty";
    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = "Passwords must match";
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.isUserActive = async (email) => {
    // let errors = {};
    const findUser = await User.findOne({ where: { email: email } });
    if (findUser === null) {
        // errors.email = "user does not exist";
        throw new ErrorHandler(400, "user does not exist");
    } else {
        console.log("------------------------------------------------");
        console.log(findUser.active);
        return findUser.active;
    }
};
