var cwd = process.cwd();

exports.version = require(__dirname + '/package.json').version;

require('figlet').text('Tat Client v' + exports.version, {font: 'Standard'}, function (err, figlet) {

  figlet = figlet.replace(/\n/g, '\n *');

  var source = require('chug')([
    'node_modules/jymin/scripts',
    'scripts/tat-jymin.js'
  ]);

  source.concat('tat.js')
    .each(function (asset) {
      var locations = source.getLocations();
      locations.forEach(function (location, index) {
        locations[index] = location.replace(
          /^.*\/(node_modules|[Ww]ork[Ss]?p?a?c?e?)\/([a-z]+)\/(.*?)$/,
          ' *   https://github.com/lighterio/$2/blob/master/$3');
      });
      asset.setContent((
        "/**\n" +
        " *" + figlet + "\n" +
        " *\n" +
        " * http://lighter.io/tat\n" +
        " * MIT License\n" +
        " *\n" +
        " * Source files:\n" +
        locations.join("\n") + "\n" +
        " */\n\n\n" +
        asset.getContent() + "\n" +
        "window.Tat = Tat;\n").replace(/[\t ]*\n/g, '\n'));
    })
    .wrap('window')
    .minify()
    .write(cwd, 'tat-client.js')
    .write(cwd, 'tat-client.min.js', 'minified');

});
