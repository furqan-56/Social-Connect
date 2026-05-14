const messagingModule = {
  registerDeviceForRemoteMessages: jest.fn().mockResolvedValue(undefined),
  requestPermission: jest.fn().mockResolvedValue(1),
  getToken: jest.fn().mockResolvedValue('test-fcm-token'),
  onMessage: jest.fn(() => jest.fn()),
  setBackgroundMessageHandler: jest.fn(),
};

const messaging = () => messagingModule;
messaging.AuthorizationStatus = {AUTHORIZED: 1, PROVISIONAL: 2};

module.exports = messaging;
module.exports.default = messaging;
