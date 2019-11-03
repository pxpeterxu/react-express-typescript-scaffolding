const getBabelRc = require('./build/babel');

module.exports = getBabelRc({
  transformModules: true,
  isBabelRc: true,
  isClient: false,
});
