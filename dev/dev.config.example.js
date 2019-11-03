// Copy this to dev.config.js, and substitute it with your own text
// Also change .env.devserver in server/config to match this
module.exports = {
  // The server that gets used when we run `gulp sync`; if you don't
  // use `gulp sync`, any value would work!
  syncServer: 'YOURNAME.wldev.wanderlog.com',

  // The user to sync to, since root SSH should not work
  username: 'testuser',
};
