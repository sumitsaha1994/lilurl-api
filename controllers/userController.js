const User = require("../models/userModel");
const { ErrorHandler } = require("../util/errorHandler");
const {
    validateSignupData,
    validateLoginData,
    isUserActive,
    validatePasswordResetData,
} = require("../util/validators/usersValidators");
const { compareHash } = require("../services/hashingService");
const { sendResponse } = require("../util/responseHandler");
const { createToken, validateToken } = require("../services/jwtService");
const { isEmpty, isEmail } = require("../util/validators/common");
const { sendEmail } = require("../services/emailService");

exports.getUser = async (req, res, next) => {
    try {
        const user = req.user;
        const userData = await User.findOne({
            where: { email: user.userid },
        });
        if (userData) {
            sendResponse(
                200,
                {
                    user: {
                        userId: userData.email,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                    },
                },
                res
            );
        }
    } catch (error) {
        next(error);
    }
};

exports.getUserActiveStatus = async (req, res, next) => {
    try {
        const user = req.user;
        console.log(req.user);
        const userData = await User.findOne({
            where: { email: user.userid },
        });
        if (userData) {
            sendResponse(
                200,
                {
                    active: userData.active,
                },
                res
            );
        } else {
            throw new ErrorHandler(400, { error: "user not found" });
        }
    } catch (error) {
        next(error);
    }
};

exports.getLoggedInUserData = async (req, res, next) => {
    try {
        const user = req.user;
        const userData = await User.findOne({
            where: { email: user.userid },
        });
        if (userData) {
            sendResponse(200, {
                userId: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
            });
        } else {
            throw new ErrorHandler(400, { error: "user not found" });
        }
    } catch (error) {
        next(error);
    }
};

exports.signUpUser = async (req, res, next) => {
    try {
        const signUpData = {
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
        };
        console.log(signUpData);
        const { errors, valid } = await validateSignupData(signUpData);
        if (valid) {
            delete signUpData.confirmPassword;
            // await User.sync({ force: true });
            await User.create(signUpData);
            sendResponse(200, { signup: "signed up successfully" }, res);
        } else {
            //res.status(400).json(errors);
            throw new ErrorHandler(400, errors);
        }
    } catch (error) {
        next(error);
    }
};

exports.userLogin = async (req, res, next) => {
    try {
        const loginData = {
            email: req.body.email,
            password: req.body.password,
        };
        const { errors, valid } = validateLoginData(loginData);
        if (valid) {
            const userData = await User.findOne({
                where: { email: loginData.email },
            });

            if (userData === null) {
                throw new ErrorHandler(400, {
                    email: "email does not exist",
                });
            } else {
                console.log(userData.password);
                const result = await compareHash(loginData.password, userData.password);
                console.log(result);
                if (result) {
                    const token = createToken(
                        { userid: userData.email },
                        process.env.JWT_LOGIN_KEY,
                        300
                    );
                    res.cookie("userloggedin", token, {
                        httpOnly: true,
                        sameSite: "None",
                        secure: true,
                    });
                    sendResponse(200, { login: "login successful" }, res);
                } else {
                    throw new ErrorHandler(400, {
                        login: "wrong credentials",
                    });
                }
            }
        } else {
            throw new ErrorHandler(400, errors);
        }
    } catch (error) {
        next(error);
    }
};

exports.logOut = (req, res, next) => {
    try {
        res.clearCookie("userloggedin");
        sendResponse(200, { logout: "successfully logged out" }, res);
    } catch (error) {
        next(error);
    }
};

exports.sendAccountActivationEmail = async (req, res, next) => {
    try {
        const toEmailId = req.user.userid;
        const userData = await User.findOne({ where: { email: toEmailId } });
        if (userData) {
            if (!userData.active) {
                const urlToken = createToken(
                    { email: toEmailId },
                    process.env.JWT_ACTIVATION_LINK_KEY,
                    "1d"
                );
                const activationURL = `${process.env.CLIENT_DOMAIN}/user/accountActivation/${urlToken}`;

                console.log(
                    `<p>click <a href=${activationURL}>here</a> to activate your account. This link expires in 24 hours.</p>`
                );
                const info = await sendEmail(
                    toEmailId,
                    "Lilurl - Account activation link",
                    `<p>click <a href="${activationURL}">here</a> to activate your account. This link expires in 24 hours.</p>`
                );
                sendResponse(
                    200,
                    {
                        accountActivationEmail: `Message sent: ${info.messageId}`,
                    },
                    res
                );
                console.log("Message sent: %s", info.messageId);
            } else {
                throw new ErrorHandler(400, {
                    accountActivationEmail: "user is already activated",
                });
            }
        } else {
            throw new ErrorHandler(400, {
                accountActivationEmail: "not a valid user",
            });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};

exports.validateAccountActivationRequest = async (req, res, next) => {
    try {
        const token = req.body.urlToken;
        console.log(req.body);
        if (isEmpty(token)) {
            throw new ErrorHandler(400, {
                accountActivation: "Link is not valid.",
            });
        }
        const userData = validateToken(token, process.env.JWT_ACTIVATION_LINK_KEY);
        console.log(userData);
        if (userData) {
            console.log(userData);
            const userFromDB = await User.findOne({
                where: { email: userData.email },
            });
            if (userFromDB) {
                if (isUserActive(userData.email) === "false") {
                    return sendResponse(
                        200,
                        {
                            accountActivation: "account is already activated",
                        },
                        res
                    );
                } else {
                    await User.update(
                        { active: true },
                        {
                            where: {
                                email: userData.email,
                            },
                        }
                    );
                    sendResponse(
                        200,
                        {
                            accountActivation: "account has been activated successfully",
                        },
                        res
                    );
                }
            } else {
                throw new ErrorHandler(400, {
                    accountActivation: "user does not exist.",
                });
            }
        } else {
            throw new ErrorHandler(400, {
                accountActivation: "Link is not valid.",
            });
        }
    } catch (error) {
        next(error);
    }
};
exports.sendForgotPasswordEmail = async (req, res, next) => {
    try {
        const userEmail = req.body.email;
        if (isEmail(userEmail)) {
            const userData = await User.findOne({ where: { email: userEmail } });
            if (userData) {
                console.log(userData.passwordResetToken);
                let urlToken;
                let isTokenValid = false;
                if (userData.passwordResetToken) {
                    urlToken = userData.passwordResetToken;
                    const decodedData = validateToken(
                        urlToken,
                        process.env.JWT_ACTIVATION_LINK_KEY
                    );
                    if (decodedData) {
                        isTokenValid = true;
                    }
                }
                if (!isTokenValid) {
                    urlToken = createToken(
                        { email: userEmail },
                        process.env.JWT_PASSWORD_RESET_LINK_KEY,
                        "1d"
                    );
                    await User.update(
                        { passwordResetToken: urlToken },
                        { where: { email: userEmail } }
                    );
                }

                const passwordResetURL = `${process.env.CLIENT_DOMAIN}/user/resetPassword/${urlToken}`;
                const info = await sendEmail(
                    userEmail,
                    "Lilurl - Password reset link",
                    `<p>Click <a href="${passwordResetURL}">here</a> to reset you password</p>`
                );
                sendResponse(
                    200,
                    {
                        passwordResetEmail: `Message sent: ${info.messageId}`,
                    },
                    res
                );
                console.log("Message sent: %s", info.messageId);
            } else {
                throw new ErrorHandler(400, {
                    passwordResetEmail: "not a valid user",
                });
            }
        } else {
            throw new ErrorHandler(400, {
                errors: {
                    email: "not a valid email",
                },
            });
        }
    } catch (error) {
        next(error);
    }
};

exports.validatePasswordResetLink = async (req, res, next) => {
    try {
        const token = req.body.urlToken;
        if (isEmpty(token)) {
            throw new ErrorHandler(400, {
                passwordResetLinkValidate: "",
            });
        }
        const userData = validateToken(token, process.env.JWT_PASSWORD_RESET_LINK_KEY);
        if (userData) {
            console.log(userData);
            const userFromDB = await User.findOne({
                where: { email: userData.email },
            });
            if (userFromDB) {
                if (userFromDB.passwordResetToken === token) {
                    return sendResponse(
                        200,
                        {
                            passwordResetLinkValidate: "link valid",
                            email: userData.email,
                        },
                        res
                    );
                } else {
                    throw new ErrorHandler(400, {
                        passwordResetLinkValidate: "Invalid Link",
                    });
                }
            } else {
                throw new ErrorHandler(400, {
                    passwordResetLinkValidate: "user does not exist",
                });
            }
        } else {
            throw new ErrorHandler(400, {
                passwordResetLinkValidate: "Link is not valid.",
            });
        }
    } catch (error) {
        next(error);
    }
};

exports.forgotPasswordUpdate = async (req, res, next) => {
    try {
        const passwordData = {
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            token: req.body.token,
        };

        console.log(passwordData);

        const { errors, valid } = await validatePasswordResetData(passwordData);

        if (valid) {
            const userData = validateToken(
                passwordData.token,
                process.env.JWT_PASSWORD_RESET_LINK_KEY
            );
            if (userData) {
                User.update(
                    {
                        password: passwordData.password,
                        passwordResetToken: null,
                    },
                    { where: { email: userData.email } }
                );
                sendResponse(
                    200,
                    {
                        forgotPasswordUpdate: "Password has been changed successfully",
                    },
                    res
                );
            } else {
                throw new ErrorHandler(400, {
                    forgotPasswordUpdate: "invalid token",
                });
            }
        } else {
            throw new ErrorHandler(400, { errors });
        }
    } catch (error) {
        next(error);
    }
};

exports.updateProfileDetails = async (req, res, next) => {
    try {
        const userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        };
        let errors = {};
        if (!userData.firstName || isEmpty(userData.firstName)) {
            errors.firstName = "first name should not be blank";
        }
        if (!userData.lastName || isEmpty(userData.lastName)) {
            errors.lastName = "last name should not be blank";
        }
        if (Object.entries(errors).length) {
            throw new ErrorHandler(400, { errors });
        } else {
            const authUser = req.user.userid;
            const userFromDB = await User.findOne({
                where: { email: authUser },
            });

            if (userFromDB) {
                await User.update(
                    { firstName: userData.firstName, lastName: userData.lastName },
                    { where: { email: authUser } }
                );
                sendResponse(
                    200,
                    {
                        updateProfile: "Profile data has been updated successfully",
                    },
                    res
                );
            } else {
                throw new ErrorHandler(400, { updateProfile: "Invalid user" });
            }
        }
    } catch (error) {
        next(error);
    }
};

exports.getUserAccountStatus = async (req, res, next) => {
    try {
        const email = req.params.email;
        res.status(200).json({ active: await isUserActive(email) });
    } catch (error) {
        next(error);
    }
};
