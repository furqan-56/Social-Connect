const firestore = () => ({
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      onSnapshot: (cb) => { cb({ exists: false, data: () => null }); return () => {}; },
      collection: () => ({ get: () => Promise.resolve({ docs: [] }), add: () => Promise.resolve() }),
    }),
    get: () => Promise.resolve({ docs: [] }),
    add: () => Promise.resolve({ id: 'mock-id' }),
    where: () => ({ get: () => Promise.resolve({ docs: [] }) }),
    orderBy: () => ({ limit: () => ({ get: () => Promise.resolve({ docs: [] }) }) }),
    onSnapshot: (cb) => { cb({ docs: [] }); return () => {}; },
  }),
});
firestore.FieldValue = { serverTimestamp: () => new Date().toISOString(), arrayUnion: (...a) => a, arrayRemove: (...a) => a };
module.exports = firestore;
module.exports.default = firestore;
