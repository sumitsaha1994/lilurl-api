const nodemailer = require("nodemailer");

exports.sendEmail = async (to, subject, body) => {
    const smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: process.env.ACCESS_TOKEN,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    let info = await smtpTransport.sendMail({
        from: process.env.EMAIL,
        to: to, // list of receivers
        subject: subject, // Subject line
        html: body, // html body
    });

    return info;
};
