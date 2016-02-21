'use strict';

const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (/\.\w+$/.test(req.url)) {
    fs.readFile(`${__dirname}/../dist${req.url}`, 'utf8', (err, content) => {
      if (err) {
        res.statusCode = 404;
        res.end();
        return;
      }
      if (req.url.match(/\.js$/)) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      res.end(content);
    });
  } else {
    fs.readFile(`${__dirname}/index.html`, 'utf8', (err, html) => {
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
    });
  }
});

server.listen(3000, () => {
  console.log('Server listening on: http://localhost:%s', 3000);
});
