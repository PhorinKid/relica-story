const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
 const relative=pathname==='/'?'index.html':pathname.slice(1);
 const file=path.resolve(root,relative);
 if(!file.startsWith(root+path.sep)||relative.split(/[\\/]/).some(p=>p.startsWith('.'))||!['index.html','styles.css','app.js','model.js','combat.js','game.js','account.js','auth-ui.js','public-config.js'].includes(relative)&&!relative.startsWith('assets/')){res.writeHead(404);return res.end();}
 fs.stat(file,(error,stat)=>{
  if(error||!stat.isFile()){res.writeHead(404);return res.end();}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self' 'sha256-Ed0KV975SQWSHmSxWicV0hjvCZrZTezhbrAjbI3ELTA=' https://www.googletagmanager.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com; frame-src https://www.googletagmanager.com; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"});
  if(req.method==='HEAD')return res.end();
  fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 });
});
server.listen(port,'127.0.0.1',()=>console.log(`RELICA STORY: http://127.0.0.1:${port}`));
