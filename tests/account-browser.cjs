const {chromium}=require(process.env.RELICA_PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const rows=new Map();let signup=0,resets=0,passwordUpdates=0,fail=false;const errors=[];
 await context.route('**/public-config.js',r=>r.fulfill({contentType:'text/javascript',body:"window.RELICA_CONFIG={url:'https://relica-test.supabase.co',key:'sb_publishable_test',google:false};"}));
 const ids={a:'11111111-1111-4111-8111-111111111111',b:'22222222-2222-4222-8222-222222222222'};
 const user=id=>({id,email:id===ids.a?'a@example.com':'b@example.com',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email'},user_metadata:{},created_at:new Date().toISOString()});
 const token=id=>Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:id,role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
 await context.route('https://relica-test.supabase.co/**',async route=>{
  const req=route.request(),url=new URL(req.url()),body=req.postDataJSON();let data={};let status=200;
  if(url.pathname.endsWith('/token')){
   if(body.password==='badpassword'){status=400;data={code:'invalid_credentials',message:'Invalid login credentials'};}
   else{const id=body.email==='b@example.com'?ids.b:ids.a;data={access_token:token(id),refresh_token:'test-refresh',expires_in:3600,token_type:'bearer',user:user(id)};}
  }else if(url.pathname.endsWith('/signup')){signup++;data=user(ids.a);}
  else if(url.pathname.endsWith('/recover')){resets++;}
  else if(url.pathname.endsWith('/user')){if(req.method()==='PUT'&&body.password)passwordUpdates++;data=user(ids.a);}
  else if(url.pathname.endsWith('/relica_merge_progress')){
   if(fail){status=503;data={message:'offline'};}
   else{const auth=req.headers().authorization;const id=JSON.parse(Buffer.from(auth.split('.')[1],'base64url').toString()).sub;const prev=rows.get(id)||{user_id:id,best_stage:0,best_endless:0,quiz:null,quiz_updated_at:0};data={...prev,best_stage:Math.max(prev.best_stage,body.p_stage),best_endless:Math.max(prev.best_endless,body.p_endless)};if(body.p_quiz&&(!prev.quiz||body.p_quiz_updated_at>prev.quiz_updated_at)){data.quiz=body.p_quiz;data.quiz_updated_at=body.p_quiz_updated_at;}rows.set(id,data);data=[data];}
  }
  await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/');await page.locator('#enter').click();await page.locator('#login').click();
 await page.locator('#password-reset').click({timeout:2000});
 await page.locator('#email').fill('a@example.com');await page.locator('#password-reset').click();await page.waitForFunction(()=>document.querySelector('#auth-status').textContent.includes('재설정 안내'));assert.equal(resets,1);
 await page.locator('[data-auth="signup"]').click();await page.locator('#password').fill('testPassword123');await page.locator('#confirm-password').fill('testPassword123');await page.locator('#auth-submit').click();await page.waitForFunction(()=>document.querySelector('#auth-status').textContent.includes('확인 메일'));assert.equal(signup,1);
 await page.locator('[data-auth="login"]').click();await page.locator('#password').fill('badpassword');await page.locator('#auth-submit').click();await page.waitForFunction(()=>document.querySelector('#auth-status').textContent.includes('처리하지 못했습니다'));
 await page.evaluate(()=>{RelicaAccount.saveRecords({stage:3,endless:700});RelicaAccount.saveQuiz(Array(8).fill(0));});
 await page.locator('#password').fill('testPassword123');await page.locator('#auth-submit').click();await page.waitForFunction(()=>RelicaAccount.snapshot().status==='synced');
 assert.equal(rows.get(ids.a).best_stage,3);assert(rows.get(ids.a).quiz);assert(await page.locator('#account-panel').isVisible());assert.equal(await page.locator('#password').inputValue(),'');
 assert(!(await page.evaluate(()=>Object.values(localStorage).join(' '))).includes('testPassword123'));
 await page.keyboard.press('Escape');await page.locator('nav [data-page="test"]').click();assert(await page.locator('#quiz-result').isVisible());
 fail=true;await page.evaluate(()=>RelicaAccount.saveRecords({stage:7,endless:1500}));await page.waitForFunction(()=>RelicaAccount.snapshot().status==='error');
 await page.locator('#login').click();assert((await page.locator('#account-sync-status').textContent()).includes('실패'));fail=false;await page.locator('#account-sync').click();await page.waitForFunction(()=>RelicaAccount.snapshot().status==='synced');assert.equal(rows.get(ids.a).best_stage,7);
 await page.reload();await page.locator('#enter').click();await page.waitForFunction(()=>RelicaAccount.snapshot().status==='synced');assert.equal(await page.evaluate(()=>RelicaAccount.snapshot().data.stage),7);
 await page.locator('#login').click();await page.locator('#account-logout').click();await page.waitForFunction(()=>!RelicaAccount.snapshot().user);assert.equal(await page.evaluate(()=>RelicaAccount.snapshot().data.stage),0);
 await page.locator('#email').fill('b@example.com');await page.locator('#password').fill('testPassword123');await page.locator('#auth-submit').click();await page.waitForFunction(()=>RelicaAccount.snapshot().status==='synced');assert.equal(rows.get(ids.b).best_stage,0);assert.equal(rows.get(ids.b).quiz,null);assert(!(await page.locator('#quiz-result').isVisible()));
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:__dirname+'/../output/account-mobile.png'});
 await page.locator('#account-logout').click();await page.waitForFunction(()=>!RelicaAccount.snapshot().user);
 await page.locator('#email').fill('a@example.com');await page.locator('#password-reset').click();await page.waitForFunction(()=>document.querySelector('#auth-status').textContent.includes('재설정 안내'));
 await page.goto('http://127.0.0.1:4173/?relica_auth=recovery&code=recovery-test');await page.waitForFunction(()=>RelicaAccount.snapshot().recovery);
 assert(await page.locator('#recovery-panel').isVisible());await page.locator('#new-password').fill('newPassword456');await page.locator('#new-password-confirm').fill('newPassword456');await page.locator('#recovery-panel button').click();await page.waitForFunction(()=>!RelicaAccount.snapshot().recovery);assert.equal(passwordUpdates,1);
 assert.deepEqual(errors,[]);console.log('PASS auth SDK HTTP integration: signup, reset, invalid login, login, guest migration, server sync failure/retry, reload, logout, separate account, mobile, PKCE recovery link and password update');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
