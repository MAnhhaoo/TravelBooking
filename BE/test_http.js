const http = require('http');
const url = process.argv[2] || 'http://localhost:8080/api-docs';
http.get(url, (res) => {
  console.log('status', res.statusCode);
  console.log('content-type', res.headers['content-type']);
  let body='';
  res.on('data', (c) => body += c);
  res.on('end', () => console.log('body:', body.slice(0,300)));
}).on('error', (e) => console.error('err', e.message));
