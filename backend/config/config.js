module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
};