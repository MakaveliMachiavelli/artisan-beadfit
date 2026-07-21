const rateLimit = require('express-rate-limit');
console.log(rateLimit.default({ validate: false }).validate);
