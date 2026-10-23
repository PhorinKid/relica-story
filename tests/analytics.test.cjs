const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
test('GTM is installed once, without a duplicate direct GA loader, and allowed by CSP',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(scripts.length,1);
 assert.match(scripts[0][1],/GTM-5PN3C32P/);
 assert.doesNotMatch(html,/gtag\/js|gtag\(|G-HXV2H1HVVW|GTM-N8T9PQBT|G-BY8CYHDV4H|GTM-WLG9XTKF/);
 assert.match(html,/<body>\s*<!-- Google Tag Manager \(noscript\) -->\s*<noscript><iframe/);
 const hash=crypto.createHash('sha256').update(scripts[0][1]).digest('base64');
 assert.ok(fs.readFileSync('server.cjs','utf8').includes("'sha256-"+hash+"'"));
 assert.match(fs.readFileSync('docs/setup/analytics.md','utf8'),/G-826N17NSKE/);
});
