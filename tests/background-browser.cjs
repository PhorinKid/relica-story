const {chromium}=require(process.env.RELICA_PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.route('**/public-config.js',r=>r.fulfill({contentType:'text/javascript',body:"window.RELICA_CONFIG={url:'',key:'',google:false};"}));await page.goto('http://127.0.0.1:4173/');await page.locator('#enter').click();await page.locator('nav [data-page="game"]').click();await page.waitForFunction(()=>!document.querySelector('#game-start').disabled);
 const samples=[];
 for(const [id,title] of [['aren','황야'],['elia','숲'],['selene','호수'],['noir','밤 도심']]){
  await page.locator('[data-character="'+id+'"]').click();await page.waitForFunction(id=>document.querySelector('#phaser-mount canvas').dataset.background===id,id,{timeout:2000});
  assert((await page.locator('#game-environment').textContent()).includes(title));
  const sample=await page.evaluate(()=>{const source=document.querySelector('#phaser-mount canvas'),target=document.createElement('canvas');target.width=20;target.height=20;const ctx=target.getContext('2d');ctx.drawImage(source,580,320,20,20,0,0,20,20);return Array.from(ctx.getImageData(0,0,20,20).data).join(',');});samples.push(sample);
  await page.locator('#game-start').click();await page.waitForFunction(()=>RelicaDefense.combat.projectiles.length>0);await page.locator('#defense-arena').screenshot({path:'output/background-'+id+'-arena.png'});
  await page.locator('#game-stop').click();
 }
 assert.equal(new Set(samples).size,4,'Actual terrain pixels must change with each member');
 await page.setViewportSize({width:390,height:844});await page.locator('[data-character="selene"]').click();await page.locator('#game-start').click();await page.waitForFunction(()=>document.querySelector('#phaser-mount canvas').dataset.background==='selene');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'output/background-selene-mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS four member backgrounds loaded, actual terrain changes on selection, theme labels, live combat, mobile layout');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
