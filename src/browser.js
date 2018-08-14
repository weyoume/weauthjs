/* eslint-env browser */

const ezauth = require('./ezauth');

if (typeof window !== 'undefined') {
  window.ezauth = ezauth;
}

if (typeof global !== 'undefined') {
  global.ezauth = ezauth;
}

module.exports = ezauth;
