const fetch = require('cross-fetch');

class SDKError extends Error {
  constructor(message, obj) {
    super(message);
    this.name = 'SDKError';
    this.error = obj.error;
    this.error_description = obj.error_description;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

function weauthjs() {
  this.options = {
    baseURL: 'https://auth.ezira.io',
    app: '',
    callbackURL: '',
    scope: [],
  };
}

weauthjs.prototype.setBaseURL = function setBaseURL(baseURL) {
  this.options.baseURL = baseURL;
};
weauthjs.prototype.setApp = function setApp(app) {
  this.options.app = app;
};
weauthjs.prototype.setCallbackURL = function setCallbackURL(callbackURL) {
  this.options.callbackURL = callbackURL;
};
weauthjs.prototype.setAccessToken = function setAccessToken(accessToken) {
  this.options.accessToken = accessToken;
};
weauthjs.prototype.removeAccessToken = function removeAccessToken() {
  this.options.accessToken = undefined;
};
weauthjs.prototype.setScope = function setScope(scope) {
  this.options.scope = scope;
};

weauthjs.prototype.getLoginURL = function getLoginURL(state) {
  let loginURL = `${this.options.baseURL}/oauth2/authorize?client_id=${
    this.options.app
  }&redirect_uri=${encodeURIComponent(this.options.callbackURL)}`;
  loginURL += this.options.scope ? `&scope=${this.options.scope.join(',')}` : '';
  loginURL += state ? `&state=${encodeURIComponent(state)}` : '';
  return loginURL;
};

weauthjs.prototype.send = function send(route, method, body, cb) {
  const url = `${this.options.baseURL}/api/${route}`;
  const promise = fetch(url, {
    method,
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: this.options.accessToken,
    },
    body: JSON.stringify(body),
  })
    .then((res) => {
      const json = res.json();
      // If the status is something other than 200 we need
      // to reject the result since the request is not considered as a fail
      if (res.status !== 200) {
        return json.then(result => Promise.reject(new SDKError('weauthjs error', result)));
      }
      return json;
    })
    .then((res) => {
      if (res.error) {
        return Promise.reject(new SDKError('weauthjs error', res));
      }
      return res;
    });

  if (!cb) return promise;

  return promise.then(res => cb(null, res)).catch(err => cb(err, null));
};

weauthjs.prototype.broadcast = function broadcast(operations, cb) {
  return this.send('broadcast', 'POST', { operations }, cb);
};

weauthjs.prototype.me = function me(cb) {
  return this.send('me', 'POST', {}, cb);
};

weauthjs.prototype.vote = function vote(voter, author, permlink, weight, cb) {
  const params = {
    voter,
    author,
    permlink,
    weight,
  };
  return this.broadcast([['vote', params]], cb);
};

weauthjs.prototype.comment = function comment(
  parentAuthor,
  parentPermlink,
  author,
  permlink,
  title,
  body,
  json,
  cb
) {
  const params = {
    parent_author: parentAuthor,
    parent_permlink: parentPermlink,
    author,
    permlink,
    title,
    body,
    json: JSON.stringify(json),
  };
  return this.broadcast([['comment', params]], cb);
};

weauthjs.prototype.reblog = function reblog(account, author, permlink, cb) {
  const params = {
    required_auths: [],
    required_posting_auths: [account],
    id: 'follow',
    json: JSON.stringify([
      'reblog',
      {
        account,
        author,
        permlink,
      },
    ]),
  };
  return this.broadcast([['customJson', params]], cb);
};

weauthjs.prototype.follow = function follow(follower, following, cb) {
  const params = {
    required_auths: [],
    required_posting_auths: [follower],
    id: 'follow',
    json: JSON.stringify(['follow', { follower, following, what: ['blog'] }]),
  };
  return this.broadcast([['customJson', params]], cb);
};

weauthjs.prototype.unfollow = function unfollow(unfollower, unfollowing, cb) {
  const params = {
    required_auths: [],
    required_posting_auths: [unfollower],
    id: 'follow',
    json: JSON.stringify(['follow', { follower: unfollower, following: unfollowing, what: [] }]),
  };
  return this.broadcast([['customJson', params]], cb);
};

weauthjs.prototype.ignore = function ignore(follower, following, cb) {
  const params = {
    required_auths: [],
    required_posting_auths: [follower],
    id: 'follow',
    json: JSON.stringify(['follow', { follower, following, what: ['ignore'] }]),
  };
  return this.broadcast([['customJson', params]], cb);
};

weauthjs.prototype.claimRewardBalance = function claimRewardBalance(
  account,
  ECOreward,
  EUSDreward,
  ESCORreward,
  cb
) {
  const params = {
    account,
    ECOreward: ECOreward,
    EUSDreward: EUSDreward,
    ESCORreward: ESCORreward,
  };
  return this.broadcast([['claimRewardBalance', params]], cb);
};

weauthjs.prototype.revokeToken = function revokeToken(cb) {
  return this.send('oauth2/token/revoke', 'POST', { token: this.options.accessToken }, cb).then(
    () => this.removeAccessToken()
  );
};

weauthjs.prototype.updateUserMetadata = function updateUserMetadata(metadata = {}, cb) {
  return this.send('me', 'PUT', { user_metadata: metadata }, cb);
};

weauthjs.prototype.sign = function sign(name, params, redirectUri) {
  if (typeof name !== 'string' || typeof params !== 'object') {
    return new SDKError('weauthjs error', {
      error: 'invalid_request',
      error_description: 'Request has an invalid format',
    });
  }
  let url = `${this.options.baseURL}/sign/${name}?`;
  url += Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  url += redirectUri ? `&redirect_uri=${encodeURIComponent(redirectUri)}` : '';
  return url;
};

exports.Initialize = function Initialize(config) {
  const instance = new weauthjs();

  if (!config) {
    throw new Error('You have to provide config');
  }

  if (typeof config !== 'object') {
    throw new Error('Config must be an object');
  }

  if (config.baseURL) instance.setBaseURL(config.baseURL);
  if (config.app) instance.setApp(config.app);
  if (config.callbackURL) instance.setCallbackURL(config.callbackURL);
  if (config.accessToken) instance.setAccessToken(config.accessToken);
  if (config.scope) instance.setScope(config.scope);

  return instance;
};
