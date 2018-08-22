/* eslint-env browser */

const weauthjs = require('./index.js');

if (typeof window !== 'undefined') {
  window.weauthjs = weauthjs;
}

if (typeof global !== 'undefined') {
  global.weauthjs = weauthjs;
}

module.exports = weauthjs;
