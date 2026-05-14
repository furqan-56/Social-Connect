const messaging = () => ({
  getToken: () => Promise.resolve('web-mock-token'),
  onMessage: () => () => {},
  requestPermission: () => Promise.resolve(1),
  hasPermission: () => Promise.resolve(1),
});
messaging.AuthorizationStatus = { AUTHORIZED: 1 };
module.exports = messaging;
module.exports.default = messaging;
