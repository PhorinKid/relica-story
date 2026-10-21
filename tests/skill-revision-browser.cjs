const {chromium}=require(process.env.RELICA_PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
for(const url of ['http://127.0.0.1:4173/',pathToFileURL(path.resolve(__dirname,'../index.html')).href]){
const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await p.goto(url);await p.click('#enter');await p.locator('nav [data-page="game"]').click();await p.waitForFunction(()=>!document.querySelector('#game-start').disabled);
await p.locator('[data-character="noir"]').click();await p.click('#game-start');
// Force the offered skill only; acquire it through the real upgrade button.
await p.evaluate(()=>{const g=RelicaDefense.combat;g.gainExperience(4);g.choices=[RelicaCombat.upgrades.find(u=>u.id==='daggerFan')];});
const dagger=p.locator('[data-upgrade="daggerFan"]');await dagger.waitFor();assert.match(await dagger.textContent(),/0\.12/);assert.equal(await p.locator('[data-upgrade="bleed"]').count(),0);await dagger.click();
const shot=await p.evaluate(()=>{const g=RelicaDefense.combat;g.projectiles=[];g.pendingShots=[];g.aimMode='manual';g.aim=0;g.fire();return {rank:g.rank('daggerFan'),angles:g.projectiles.map(p=>p.angle),bounces:g.projectiles.map(p=>p.bouncesLeft)};});
assert.equal(shot.rank,1);assert.deepEqual(shot.angles,[-.12,0,.12]);assert.deepEqual(shot.bounces,[2,2,2]);await p.click('#game-stop');
await p.locator('[data-character="elia"]').click();await p.click('#game-start');await p.evaluate(()=>{const g=RelicaDefense.combat;g.gainExperience(4);g.choices=[RelicaCombat.upgrades.find(u=>u.id==='explosive')];});
const explosion=p.locator('[data-upgrade="explosive"]');await explosion.waitFor();assert.match(await explosion.textContent(),/항상 폭발/);assert.match(await explosion.textContent(),/10%/);await explosion.click();
const damage=await p.evaluate(()=>{const g=RelicaDefense.combat;g.random=()=>.999;const a={id:901,x:400,y:230,hp:100,maxHp:100},near={id:902,x:424,y:230,hp:100,maxHp:100},far={id:903,x:425,y:230,hp:100,maxHp:100};g.enemies=[a,near,far];g.impact({memberId:'elia',skills:{...g.upgrades},power:0,multiplier:1},a);return g.enemies.map(e=>e.hp);});
assert.deepEqual(damage,[60,96,100]);await p.click('#game-stop');assert.deepEqual(errors,[]);await p.close();console.log('PASS revised skill buttons, dagger fan 0.12, always-on explosion damage/radius:',url);
}}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
