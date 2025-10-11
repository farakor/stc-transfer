const http = require('http');

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/vehicles/types',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ API Response received:');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
      process.exit(0);
    });
  });

  req.on('error', (err) => {
    console.error('❌ API Error:', err.message);
    process.exit(1);
  });

  req.end();
}

// Ждем секунду, затем тестируем
setTimeout(testAPI, 1000);