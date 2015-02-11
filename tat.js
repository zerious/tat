var tat = module.exports;

/**
 * Expose the Tat version via package.json lazy loading.
 */
Object.defineProperty(tat, 'version', {
  get: function () {
    return require(__dirname + '/package.json').version;
  }
});
