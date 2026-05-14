module.exports = {
  launchImageLibrary: (_, cb) => cb({ didCancel: true, assets: [] }),
  launchCamera: (_, cb) => cb({ didCancel: true, assets: [] }),
};
