const {chromium}=require(process.env.RELICA_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/public-config.js',r=>r.fulfill({contentType:'text/javascript',body:"window.RELICA_CONFIG={url:'',key:'',google:false};"}));await page.goto('http://127.0.0.1:4173/');
 await page.locator('#enter').click();
 await page.locator('nav [data-page="test"]').click();
 await page.locator('#quiz-start').click({timeout:2000});
 assert(await page.locator('#quiz-next').isDisabled());
 await page.getByRole('radio').nth(2).check();
 await page.locator('#quiz-next').click();
 await page.locator('#quiz-back').click();
 assert(await page.getByRole('radio').nth(2).isChecked());
 // Choose the observation-focused member for every question.
 for(let i=0;i<8;i++){
 const index=await page.evaluate(i=>Relica.quizQuestions[i].options.findIndex(o=>o.member==='noir'),i);
 await page.getByRole('radio').nth(index).check();
 await page.locator('#quiz-next').click();
 }
 assert((await page.locator('#quiz-result').textContent()).includes('누아르'));
 assert((await page.locator('#quiz-save-status').textContent()).includes('저장했습니다'));
 await page.screenshot({path:__dirname+'/../output/quiz-result-desktop.png',fullPage:true});
 await page.reload();await page.locator('#enter').click();await page.locator('nav [data-page="test"]').click();
 assert(await page.locator('#quiz-result').isVisible());
 await page.locator('#quiz-play').click();
 await page.waitForFunction(()=>!document.querySelector('#game-start').disabled);
 assert.equal(await page.locator('[data-character="noir"]').getAttribute('aria-pressed'),'true');
 await page.locator('#game-start').click();
 await page.locator('nav [data-page="test"]').click();
 await page.locator('#quiz-retry').click();
 for(let i=0;i<8;i++){
 const index=await page.evaluate(i=>Relica.quizQuestions[i].options.findIndex(o=>o.member==='aren'),i);
 await page.getByRole('radio').nth(index).check();await page.locator('#quiz-next').click();
 }
 await page.locator('#quiz-play').click();
 assert((await page.locator('#quiz-game-notice').textContent()).includes('진행 중'));
 assert.equal(await page.locator('[data-character="noir"]').getAttribute('aria-pressed'),'true');
 await page.locator('#game-stop').click();
 await page.locator('nav [data-page="test"]').click();await page.locator('#quiz-play').click();
 assert.equal(await page.locator('[data-character="aren"]').getAttribute('aria-pressed'),'true');
 await page.setViewportSize({width:390,height:844});
 await page.locator('nav [data-page="test"]').click();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:__dirname+'/../output/quiz-result-mobile.png',fullPage:true});
 await page.locator('#quiz-retry').click();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:__dirname+'/../output/quiz-question-mobile.png',fullPage:true});
 await page.getByRole('radio').first().check();await page.locator('#quiz-next').click();
 await page.locator('.wordmark').click();await page.locator('nav [data-page="test"]').click();
 assert((await page.locator('#quiz-position').textContent()).includes('02'));
 assert.deepEqual(errors,[]);
 // Storage-denied browsing still completes the quiz and displays the result.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});
 const p=await blocked.newPage();await p.route('**/public-config.js',r=>r.fulfill({contentType:'text/javascript',body:"window.RELICA_CONFIG={url:'',key:'',google:false};"}));await p.goto('http://127.0.0.1:4173/');await p.locator('#enter').click();await p.locator('nav [data-page="test"]').click();await p.locator('#quiz-start').click();
 for(let i=0;i<8;i++){await p.getByRole('radio').first().check();await p.locator('#quiz-next').click();}
 assert(await p.locator('#quiz-result').isVisible());assert((await p.locator('#quiz-save-status').textContent()).includes('저장하지 못했습니다'));
 await blocked.close();console.log('PASS quiz: answers, back, result, restore, game handoff, active battle, mobile, unavailable storage');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
