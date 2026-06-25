const http = require('http');
const https = require('https');
const url = require('url');
const maxRedirects = 10;
let current = process.argv[2] || 'http://localhost:8080/api-docs/';
let count = 0;
const request = (target) => {
  const parsed = url.parse(target);
  const lib = parsed.protocol === 'https:' ? https : http;
  lib.get(parsed, (res) => {
    console.log('REQUEST', target);
    console.log('STATUS', res.statusCode);
    console.log('LOCATION', res.headers.location);
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', () => {
      console.log('BODY-START', body.slice(0,200));
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location && count < maxRedirects) {
        count += 1;
        const next = url.resolve(target, res.headers.location);
        request(next);
      }
    });
  }).on('error', (e) => console.error('ERROR', e.message));
};
request(current);
