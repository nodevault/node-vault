const https = require('https');
const http = require('http');
const { URL } = require('url');

module.exports = async function request(options) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.uri);
    const { method, headers } = options;
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers,
    };
    let module = http;
    if (url.protocol.indexOf('https') !== -1) {
      requestOptions.rejectUnauthorized = options.strictSSL;
      module = https;
    }
    const req = module.request(requestOptions, (response) => {
      let responseData = '';
      response.on('data', (chunk) => {
        responseData += chunk;
      });
      response.on('end', () => {
        if (typeof responseData === 'string') {
          responseData = JSON.parse(responseData);
        }
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: responseData,
          request: requestOptions,
        });
      });
    });
    req.on('error', (error) => {
      reject(error);
    });
    if (options.json && options.json !== true) {
      let b = options.json;
      if (typeof b !== 'string') {
        b = JSON.stringify(b);
      }
      req.write(b);
    }
    req.end();
  });
};
