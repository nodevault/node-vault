module.exports = function (opts) {
  const mustache = opts.mustache || require('mustache');
  const Promise = opts.Promise || require('bluebird');
  const vault = {};

  vault.help = function (path, opts) {
    return new Promise(function (resolve, reject) {
      resolve('hello');
    });

    // debug("help for %s", path);
    // [opts, done] = @_handleCallback opts, done
    // opts.path = '/' + path + '?help=1'
    // opts.json = null
    // opts.method = 'GET'
    // _request opts, @_handleErrors(done)
  };

  return vault;
};
