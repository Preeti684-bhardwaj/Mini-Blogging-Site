const dotenv = require('dotenv').config();

const {MONGOOSE_CONNECTION, SECRETE_KEY } = process.env


module.exports = { MONGOOSE_CONNECTION  : MONGOOSE_CONNECTION, SECRETE_KEY : SECRETE_KEY}