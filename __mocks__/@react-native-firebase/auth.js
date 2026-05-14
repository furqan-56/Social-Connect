const authModule = {
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({user: {uid: 'test-uid'}}),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({}),
  signOut: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  onAuthStateChanged: jest.fn(callback => {
    callback(null);
    return jest.fn();
  }),
  currentUser: null,
};

const auth = () => authModule;
auth.AuthorizationStatus = {AUTHORIZED: 1, PROVISIONAL: 2};

module.exports = auth;
module.exports.default = auth;
