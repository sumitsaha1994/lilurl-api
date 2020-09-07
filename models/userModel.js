const sequelize = require("sequelize");
const lilurlDB = require("../config/dbconfig");
const { generateHash } = require("../services/hashingService");

const User = lilurlDB.define(
    "user",
    {
        id: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            type: sequelize.STRING,
            field: "first_name",
        },
        lastName: {
            type: sequelize.STRING,
            field: "last_name",
        },
        email: {
            type: sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: sequelize.STRING,
            allowNull: false,
        },
        passwordResetToken: {
            type: sequelize.STRING,
            field: "password_reset_token",
        },
        active: {
            type: sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        setterMethods: {
            password(plaintextPassword) {
                this.setDataValue("password", generateHash(plaintextPassword));
            },
        },
    }
);

module.exports = User;
