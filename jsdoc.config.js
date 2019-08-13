module.exports = {
  plugins: [
    'plugins/markdown',
  ],
  opts: {
    destination: './docs/',
    encoding: 'utf8',
    private: true,
    readme: './README.md',
    recurse: true,
    verbose: false,
  },
  templates: {
    theme: 'flatly',
    includeDate: false,
  }
};
