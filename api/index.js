process.env.VERCEL = '1';
const app = require('../apps/api/dist/server').default;
module.exports = app;
