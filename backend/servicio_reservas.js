const http = require('http');

let isLock = false;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/buy') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      while (isLock) { await new Promise(r => setTimeout(r, 50)); }
      isLock = true;

      try {
        const payload = JSON.stringify({ quantity: 1 });
        const options = {
          hostname: 'localhost', port: 3001, path: '/concerts/c1/reduce', method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length }
        };

        const catReq = http.request(options, (catRes) => {
          let catData = '';
          catRes.on('data', chunk => catData += chunk);
          catRes.on('end', () => {
            const data = JSON.parse(catData || '{}');
            res.writeHead(catRes.statusCode, { 'Content-Type': 'application/json' });
            if (data.success) {
              res.end(JSON.stringify({ status: 'CONFIRMED', ticketId: 'TCK-' + Math.floor(Math.random()*10000), remaining: data.remaining }));
            } else {
              res.end(JSON.stringify({ status: 'REJECTED', message: data.message }));
            }
            isLock = false;
          });
        });

        catReq.on('error', () => {
          res.writeHead(500); res.end(JSON.stringify({ status: 'ERROR', message: 'Error con Servicio Catálogo' }));
          isLock = false;
        });

        catReq.write(payload);
        catReq.end();
      } catch (e) {
        isLock = false;
      }
    });
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(3002, () => console.log('Reservas escuchando en http://localhost:3002'));