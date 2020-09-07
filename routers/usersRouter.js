const express = require("express");
const usersRouter = express.Router();

const {
    signUpUser,
    userLogin,
    getUserAccountStatus,
    sendAccountActivationEmail,
    validateAccountActivationRequest,
    sendForgotPasswordEmail,
    validatePasswordResetLink,
    forgotPasswordUpdate,
    getUser,
    getUserActiveStatus,
    updateProfileDetails,
    logOut,
} = require("../controllers/userController");
const auth = require("../middlewares/auth");

usersRouter
    .get("/getUser", auth, getUser)
    .get("/getUserActiveStatus", auth, getUserActiveStatus)
    .post("/signup", signUpUser)
    .post("/login", userLogin)
    .get("/logout", logOut)
    .post("/sendActivationEmail", auth, sendAccountActivationEmail)
    .post("/verifyEmailActivation", validateAccountActivationRequest)
    .post("/sendForgotPasswordEmail", sendForgotPasswordEmail)
    .post("/verifyPasswordResetLink", validatePasswordResetLink)
    .put("/updatePassword", forgotPasswordUpdate)
    .put("/updateProfileDetails", auth, updateProfileDetails)
    .get("/isActive/:email", auth, getUserAccountStatus);

module.exports = usersRouter;
