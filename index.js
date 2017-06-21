import auth0 from 'auth0-js';

// Generates a fake guid: https://stackoverflow.com/a/105074/97275
// This is not a UUID v1 or v4 it simply looks like one on the surface.
const getRandom = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

const getNonce = (returnTo) => {
  const auth = (localStorage.auth && JSON.parse(localStorage.auth)) || {};
  auth.nonce = getRandom();
  auth.returnTo = returnTo;
  localStorage.auth = JSON.stringify(auth);
  return auth.nonce;
};

const checkNonce = (nonce) => {
  let returnTo = false;
  let nonceFromStorage = false;
  if (localStorage.auth) {
    const auth = JSON.parse(localStorage.auth);
    returnTo = auth.returnTo;
    nonceFromStorage = auth.nonce;
    delete localStorage.auth;
  }

  if (nonceFromStorage === nonce) return returnTo;

  return false;
};

const redirectAuth = (webAuth, returnTo) => {
  const nonce = getNonce(returnTo);
  webAuth.authorize({ state: nonce, nonce });
  console.log("Carlos, after authorize, location: ", global.window.location);
  console.log("Carlos, after authorize, location2: ", window.location);
};

const processAuthResult = (err, authResult, webAuth, cb) => {
  if (err) {
    // check state
    const returnTo = checkNonce(err.state);

    if (err.error && (err.error === 'login_required' || err.error === 'consent_required')) {
      redirectAuth(webAuth, returnTo);
      return cb();
    }

    return cb(err);
  }

  return cb(null, authResult);
};

const renewAuth = (webAuth, cb) => {
  const nonce = getNonce(window.location.path);
  webAuth.renewAuth({ state: nonce, nonce, redirectUri: 'http://c0der.local:3001/silent-callback' }, (err, authResult) =>
    processAuthResult(err, authResult, webAuth, cb));
};

const bootstrapAuth = (options, cb) => {
  // Check local session, if it exists, check expiration, if both are good, you are logged in already
  var unixEpoch = Math.floor((new Date).getTime() / 1000)
  if (localStorage.tokens && localStorage.tokens.expiresAt < unixEpoch) {
    return cb(null, localStorage.tokens);
  }

  const webAuth = new auth0.WebAuth(options);

  // Check for window.location.hash and parse if it exists
  if (window.location.hash) {
    return webAuth.parseHash(window.location.hash,
      (err, authResult) => processAuthResult(err, authResult, webAuth, cb));
  }

  return renewAuth(webAuth, cb);
};

export default bootstrapAuth;

window.bootstrapAuth = bootstrapAuth;
