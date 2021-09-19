let port = null;

module.exports = {
  setPort: (_port) => {
    port = _port;
  },
  getPort: () => {
    return port;
  },
};
