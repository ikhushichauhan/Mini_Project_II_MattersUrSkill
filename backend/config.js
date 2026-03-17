module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'mattersurskill_secret',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};