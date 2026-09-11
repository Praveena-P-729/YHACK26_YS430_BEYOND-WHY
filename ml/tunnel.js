import localtunnel from 'localtunnel';
import fs from 'fs';

(async () => {
  try {
    const sub = 'landguard-ai-' + Math.floor(1000 + Math.random() * 9000);
    const tunnel = await localtunnel({ port: 3000, subdomain: sub });
    const url = tunnel.url;
    console.log('PUBLIC_DEPLOYMENT_URL=' + url);
    fs.writeFileSync('public_url.txt', url, 'utf-8');
    
    tunnel.on('close', () => {
      console.log('Tunnel closed.');
    });
    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to create tunnel:', err);
  }
})();
