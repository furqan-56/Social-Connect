const mockUser = null;
const listeners = [];

const auth = () => ({
  onAuthStateChanged: (cb) => { cb(mockUser); return () => {}; },
  signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not available on web demo')),
  createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not available on web demo')),
  signOut: () => Promise.resolve(),
  sendPasswordResetEmail: () => Promise.resolve(),
  currentUser: mockUser,
});

auth.Auth = {};
module.exports = auth;
module.exports.default = auth;
