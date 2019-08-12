module.exports = {
  plugins: [
    'plugins/markdown',
  ],
  opts: {
    destination: './docs/',
    encoding: 'utf8',
    // package: './package.json',
    private: true,
    readme: './README.md',
    recurse: true,
    verbose: false,
  },
  templates: {
    theme: 'flatly'
  }
};
