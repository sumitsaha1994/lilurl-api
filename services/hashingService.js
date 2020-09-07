const bcrypt = require("bcrypt");
const { ErrorHandler } = require("../util/errorHandler");

const saltRounds = 10;

exports.generateHash = (string) => {
    console.log(string);
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(string, salt);
    console.log(hash);
    return hash;
};

exports.compareHash = async (plainTextPassword, passwordHash) => {
    let result = false;
    try {
        result = await bcrypt.compare(plainTextPassword, passwordHash);
    } catch (error) {
        console.error(error);
        throw new ErrorHandler(500, "something went wrong");
    }
    return result;
};
//console.log(this.generateHash("abcdfk"));
