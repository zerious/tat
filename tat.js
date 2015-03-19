var tat = module.exports;

/**
 * Pull the compiled contents of a load of compiled Ltl templates, and wrap
 * their JavaScript inside a Tat call to create a custom tag.
 *
 * @param  {Load} load  A load of assets compiled by Chug.
 */
tat.wrapAssets = function (load) {
  load.assets.forEach(function (asset) {
    var fn = asset.compiledContent;
    if (fn) {
      var key = asset.location.replace(/^.*[\/\\]tags[\/\\](.*)\..*?$/, '$1');
      var tag = key.replace(/[^a-z0-9]+/g, '-');
      fn.js =
        'Tat(' + JSON.stringify(tag) + ',' + fn.toString() + ');//@tat\n' +
        (fn.js || '').replace(/^[\s\S]+\/\/@tat\n/, '');
    }
    asset.uses[__dirname + '/scripts/tat-jymin.js'] = true;
    asset.use().route();
  });
};

/**
 * Expose the Tat version via package.json lazy loading.
 */
Object.defineProperty(tat, 'version', {
  get: function () {
    return require(__dirname + '/package.json').version;
  }
});

/**
 * Expose the paths to Tat's front-end scripts.
 */
tat.jymin = __dirname + '/scripts/tat-jymin.js';
tat.client = __dirname + '/tat-client.js';
tat.clientMin = __dirname + '/tat-client.min.js';
