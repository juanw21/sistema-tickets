const http = require('http');

let concert = { id: 'c1', name: 'Rock Fest 2026', totalTickets: 10, availableTickets: 10, price: 50 };

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && req.url === '/concerts/c1') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(concert));
  }

  if (req.method === 'POST' && req.url === '/concerts/c1/reduce') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      const qty = data.quantity || 1;
      if (concert.availableTickets >= qty) {
        concert.availableTickets -= qty;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, remaining: concert.availableTickets }));
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Stock insuficiente' }));
      }
    });
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(3001, () => console.log('Catálogo escuchando en http://localhost:3001'));