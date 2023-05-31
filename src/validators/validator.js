const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length > 0) return true;
    return false;
};

const isValidRequest = function (object) {
    return Object.keys(object).length > 0
}

const isValidEmail = function (value) {
    const regexForEmail = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
    return regexForEmail.test(value)
}

// const isValidPassword = function (value) {
//     const regexForPassword = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%&])[a-zA-Z0-9@#$%&]{6,20}$/
//     return regexForPassword.test(value)
// }
const regexNameValidator = function (value) {
    const regex = /^[A-Za-z][a-z]{1,30}$/
    return regex.test(value)
}

module.exports = {isValid, isValidRequest, isValidEmail, regexNameValidator}