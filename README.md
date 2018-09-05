## Getting Started
For general information about weauthjs and setting up your app please see this post from @noisy: [How to configure weauthjs and use it with your application](https://weyoume.io/steemconnect/@noisy/how-to-configure-steemconnect-v2-and-use-it-with-your-application-how-it-works-and-how-it-is-different-from-v1)

### Include the weauthjs SDK in your HTML page
You can download a minified version of weauthjs here: [https://eziranetwork.github.io/weauthjs-angular/weauthjs.min.js](https://eziranetwork.github.io/weauthjs-angular/weauthjs.min.js) and include it in your HTML page:
```
<script src="/scripts/weauthjs.min.js"></script>
```

## SDK Methods
### Init SDK
Call the Initialize() method when your app first loads to initialize the SDK:
```
var weauthjs = require('weauthjs');

var api = weauthjs.Initialize({
  app: 'weapp',
  callbackURL: 'http://localhost:8000/demo/',
  accessToken: 'access_token',
  scope: ['vote', 'comment']
});
```
Parameters:
- __app__: This is the name of the app that was registered in the weauthjs dashboard
- __callbackURL__: This is the URL that users will be redirected to after interacting with weauthjs. It must be listed in the "Redirect URI(s)" list in the app settings EXACTLY the same as it is specified here
- __accessToken__: If weauthjs have an oauth2 access token for this user already weauthjs can specify it here, otherwise weauthjs can leave it and set it later using weauthjs.setAccessToken(accessToken).
- __scope__: This is a list of operations the app will be able to access on the user's account. For a complete list of scopes see: [https://github.com/eziranetwork/weauth/wiki/OAuth-2#scopes](https://github.com/eziranetwork/weauth/wiki/OAuth-2#scopes)

### Get Login URL
The following method returns a URL that weauthjs can redirect the user to so that they may log in to weyoume app through weauthjs:
```
var link = api.getLoginURL(state);
console.log(link)
// => https://auth.weyoume.io/oauth2/authorize?client_id=[app]&redirect_uri=[callbackURL]&scope=vote,comment&state=[state]
```
Parameters:
- __state__: Data that will be passed to the callbackURL for your app after the user has logged in.

After logging in, weauthjs will redirect the user to the "redirect_uri" specified in the login url above and add the following query string parameters for your app to use:
- __access_token__: This is the oauth2 access token that is required to make any Ezira API calls on behalf of the current user. Once weauthjs have this weauthjs need to tell the weauthjs SDK to use it by either specifying it as a parameter to the init() method call or by calling weauthjs.setAccessToken([accessToken]).
- __expires_in__: The number of seconds until the access token expires.
- __username__: The username of the current user.

### Get user profile
Once a user is logged in to your app weauthjs can call the following method to get the details of their account:
```
api.me(function (err, res) {
  console.log(err, res)
});
```
If it is successful, the result will be a JSON object with the following properties:
```
account:{id: 338059, name: "yabapmatt", owner: {}, active: {}, posting: {}, ...}
name:"yabapmatt"
scope:["vote"]
user:"yabapmatt"
user_metadata:{}
_id:"yabapmatt"
```

### Vote
The vote() method will cast a vote on the specified post or comment from the current user:
```
api.vote(voter, author, permlink, weight, function (err, res) {
  console.log(err, res)
});
```
Parameters:
- __voter__: The protocol username of the current user.
- __author__: The protocol username of the author of the post or comment.
- __permlink__: The link to the post or comment on which to vote. This is the portion of the URL after the last "/". For example the "permlink" for this post: https://alpha.weyoume.io/steem/@ned/announcing-smart-media-tokens-smts would be "announcing-smart-media-tokens-smts".
- __weight__: The weight of the vote. 10000 equale a 100% vote.
- __callback__: A function that is called once the vote is submitted and included in a block. If successful the "res" variable will be a JSON object containing the details of the block and the vote operation.

### Comment
The comment() method will post a comment on an existing post or comment from the current user:
```
api.comment(parentAuthor, parentPermlink, author, permlink, title, body, json, function (err, res) {
  console.log(err, res)
});
```

### Generate hot signing link
The sign() method creates a URL to which your app can redirect the user to perform a signed transaction on the blockchain such as a transfer or delegation:
```
var link = api.sign('transfer', {
  to: 'fabien',
  amount: '1.000 TME',
  memo: 'Hello World!',
}, 'http://localhost:8000/demo/transfer-complete');

console.log(link);
// => https://auth.weyoume.io/sign/transfer?to=fabien&amount=1.000%20TME&memo=Hello%20World!&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fdemo%2Ftransfer-complete
```

### Logout
The revokeToken() method will log the current user out of your application by revoking the access token provided to your app for that user: 
```
api.revokeToken(function (err, res) {
  console.log(err, res)
});
```

### Reblog
```
api.reblog(account, author, permlink, function (err, res) {
  console.log(err, res)
});
```

### Follow
```
api.follow(follower, following, function (err, res) {
  console.log(err, res)
});
```

### Unfollow
```
api.unfollow(unfollower, unfollowing, function (err, res) {
  console.log(err, res)
});
```

### Ignore
```
api.ignore(follower, following, function (err, res) {
  console.log(err, res)
});
```

### Claim Reward Balance
```
api.claimRewardBalance(account, TMErewardin, TSDreward, SCOREreward, function (err, res) {
  console.log(err, res)
});
```

### Update User Metadata
```
api.updateUserMetadata(metadata, function (err, res) {
  console.log(err, res)
});
```

## Changelog
#### 1.0.1
- Fixed response error checking.

#### 1.0.0
- Migrated to instance based architecture. You have to create new instance using `Initialize` function now. See documentation above.

## contributing

### building

```console
[user@linux ~]$ npm i
[user@linux ~]$ npm run build
```
publish if weauthjs want to
```console
[user@linux ~]$ npm publish
```