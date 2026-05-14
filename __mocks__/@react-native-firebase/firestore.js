const makeDoc = (id = 'doc-id', data = null) => ({
  id,
  exists: data !== null,
  data: () => data,
});

const makeCollection = () => {
  const col = {
    doc: jest.fn(() => ({
      get: jest.fn().mockResolvedValue(makeDoc()),
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      collection: jest.fn(makeCollection),
    })),
    add: jest.fn().mockResolvedValue({
      id: 'new-doc-id',
      get: jest.fn().mockResolvedValue(makeDoc('new-doc-id', {})),
    }),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({docs: []}),
  };
  return col;
};

const firestoreInstance = {
  collection: jest.fn(makeCollection),
  runTransaction: jest.fn(fn =>
    fn({
      get: jest.fn().mockResolvedValue(makeDoc()),
      update: jest.fn(),
      set: jest.fn(),
    }),
  ),
};

const firestore = () => firestoreInstance;
firestore.FieldValue = {serverTimestamp: jest.fn()};
firestore.Timestamp = {fromDate: jest.fn()};

module.exports = firestore;
module.exports.default = firestore;
