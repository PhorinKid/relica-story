const {chromium}=require(process.env.RELICA_PLAYWRIGHT_MODULE||'playwright');const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);await page.locator('#enter').click();await page.locator('nav [data-page="game"]').click();await page.waitForFunction(()=>!document.querySelector('#game-start').disabled);
 for(const id of ['aren','elia','selene','noir']){
  await page.locator('[data-character="'+id+'"]').click();await page.locator('#game-start').click();await page.waitForFunction(id=>document.querySelector('#phaser-mount canvas').dataset.memberArt===id&&document.querySelector('#phaser-mount canvas').dataset.background===id,id,{timeout:2500});
  await page.waitForFunction(()=>RelicaDefense.combat.projectiles.length>0);await page.locator('#defense-arena').screenshot({path:'output/file-'+id+'-arena.png'});await page.locator('#game-stop').click();
 }
 await page.locator('nav [data-page="test"]').click();await page.locator('#quiz-start').click();for(let i=0;i<8;i++){await page.getByRole('radio').first().check();await page.locator('#quiz-next').click();}assert(await page.locator('#quiz-result').isVisible());await page.locator('#quiz-play').click();await page.waitForFunction(()=>document.querySelector('#phaser-mount canvas').dataset.memberArt);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.setViewportSize({width:390,height:844});await page.locator('#game-start').click();await page.screenshot({path:'output/file-game-mobile.png',fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 console.log('PASS direct file index.html: 4 SD members, 4 backgrounds, live combat, quiz handoff, mobile, no browser errors');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
