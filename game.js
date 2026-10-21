(function(){
'use strict';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const {Combat,SimulationClock,WIDTH,HEIGHT,PLAYER,GRID,NEAR_DISTANCE,WALL_MAX_HP}=RelicaCombat;
const combat=new Combat();
const sound=new RelicaPresentation.BattleSound();
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const heardShots=new WeakSet();let soundPhase=combat.phase,soundKills=0,soundWall=combat.wall;
function updateSound(){
 const phase=combat.phase;
 sound.gate(visible&&!document.hidden&&!combat.suspended&&(phase==='running'||phase==='upgrade'||phase==='waiting'||phase==='ended'));
 if(phase!==soundPhase&&['upgrade','waiting','ended'].includes(phase))sound.play(phase,selected);
 if(phase==='running'){
  let fresh=false;for(const p of combat.projectiles)if(!heardShots.has(p)){heardShots.add(p);if(p.x<210)fresh=true;}
  if(fresh)sound.play('attack',selected);if(combat.kills>soundKills)sound.play('kill',selected);if(combat.wall<soundWall)sound.play('wall',selected);
 }
 soundPhase=phase;soundKills=combat.kills;soundWall=combat.wall;
}
const clock=new SimulationClock(combat);
let lastSavedResult=null;
let visible=false,selected='aren',mode='stage',paused=false,engine=null,loading=null,ready=false,overlayKey='',saveMessage='';
let battleOwner=RelicaAccount.snapshot().owner;
let records=RelicaAccount.snapshot().data;
function text(selector,value){const el=$(selector);if(el.textContent!==String(value))el.textContent=value;}
function active(){return ['running','upgrade','waiting'].includes(combat.phase);}
function seconds(n){return `${Math.floor(n/60).toString().padStart(2,'0')}:${Math.floor(n%60).toString().padStart(2,'0')}`;}
function syncSuspend(){combat.suspended=!visible||Boolean(document.querySelector('dialog[open]'))||paused;}
function pump(now=performance.now()){syncSuspend();clock.pulse(now);updateSound();saveResult();if(visible&&!document.hidden)renderUI();}
function saveResult(){const r=combat.result;if(!r||r===lastSavedResult)return;lastSavedResult=r;const previous=RelicaAccount.store.get(battleOwner);RelicaAccount.saveRecords({stage:Math.max(previous.stage,r.mode==='stage'?r.cleared:0),endless:Math.max(previous.endless,r.mode==='endless'?r.score:0)},battleOwner);}
function finish(reason){pump();if(combat.finish(reason)){paused=false;clock.reset(performance.now());saveResult();overlayKey='';renderUI();}}
function selectedMember(){return Relica.getMember(selected)||Relica.getMember('aren');}
function select(id){if(active())return false;selected=Relica.getMember(id)?id:'aren';combat.memberId=selected;overlayKey='';renderUI();return true;}
function start(){if(!ready||active())return;battleOwner=RelicaAccount.snapshot().owner;combat.start(mode,selected);sound.unlock();clock.reset(performance.now());paused=false;overlayKey='';renderUI();}
function setMode(value){if(active())return;mode=value==='endless'?'endless':'stage';combat.mode=mode;combat.wall=combat.maxWall;renderUI();}
function overlay(content,phase){$('#game-overlay').hidden=false;$('#game-overlay').dataset.phase=phase;$('#game-overlay-content').innerHTML=content;}
function renderUI(){
 const account=RelicaAccount.snapshot();records=account.data;
 saveMessage=account.user?(account.status==='synced'?'계정에 기록을 저장했습니다.':account.status==='error'?'서버 저장에 실패했습니다. 기록을 유지하고 있으며 내 계정에서 재시도할 수 있습니다.':'계정 기록을 동기화하는 중입니다.'):(account.localAvailable?'최고 기록은 이 브라우저에 저장됩니다.':'브라우저 저장을 사용할 수 없습니다. 현재 화면의 기록만 유지됩니다.');
 const running=active();const member=selectedMember();
 text('#game-environment',member.name+' · '+RelicaPresentation.backgrounds[member.id].title);
 text('#preview-member',`${member.en} / ${member.classEn}`);
 text('#game-stage',`${mode==='stage'?'STAGE '+String(combat.stage).padStart(2,'0'):'ENDLESS'}`);
 text('#wall-value',`${combat.wall} / ${combat.maxWall}`);$('#wall-meter').max=combat.maxWall;$('#wall-meter').value=combat.wall;
 text('#level-value',combat.level);$('#xp-meter').max=combat.xpNeeded();$('#xp-meter').value=combat.xp;
 text('#kill-value',combat.kills);text('#time-value',seconds(combat.elapsed));
 text('#game-sound',!sound.available?'소리: 사용 불가':sound.enabled?'소리: 켬':'소리: 끔');$('#game-sound').setAttribute('aria-pressed',String(sound.enabled));
 text('#game-speed',`배속: ${clock.speed}×`);$('#game-speed').setAttribute('aria-pressed',String(clock.speed===2));
 text('#aim-toggle',`조준: ${combat.aimMode==='auto'?'자동':'수동'}`);$('#aim-toggle').setAttribute('aria-pressed',String(combat.aimMode==='manual'));
 text('#game-pause',paused?'재개':'일시정지');$('#game-pause').disabled=combat.phase!=='running';$('#game-stop').disabled=!running;
 $$('.character-select button').forEach(b=>{b.disabled=running;b.setAttribute('aria-pressed',String(b.dataset.character===selected));});
 $$('[data-mode]').forEach(b=>{b.disabled=running;b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});
 $('#game-start').disabled=!ready||running;
 text('#game-start',!ready?'게임 준비 중…':running?'전투 진행 중':'게임 시작');
 text('#game-hint',combat.aimMode==='auto'?'자동 조준 · 방어벽에 가장 가까운 적을 향해 발사합니다.':'수동 조준 · 화면 위에서 마우스를 움직이거나 터치하세요.');
 text('#game-wave',`${combat.spawnInterval()}초마다 ${combat.batchSize()}마리 · 회당 최대 ${combat.batchLimit()}마리${clock.pending>1?' · 경과한 전투 반영 중':''}`);
 text('#game-record',`${account.user?'내 계정':'이 브라우저'} 최고 기록 · 스테이지 ${records.stage} / 무한 ${records.endless.toLocaleString()}점`);
 text('#game-save-status',saveMessage);
 const phase=paused&&combat.phase==='running'?'paused':combat.phase;
 const key=[phase,combat.level,combat.stage,selected,ready].join(':');if(key===overlayKey)return;overlayKey=key;
 if(phase==='running'){$('#game-overlay').hidden=true;return;}
 if(phase==='upgrade'){
  overlay(`<p class="eyebrow">LEVEL ${combat.level} · CHOOSE YOUR UPGRADE</p><h2>${member.name}의 스킬을 강화하세요.</h2><p>${combat.choices.length<3?'최대 단계를 제외한 남은 강화입니다.':'공용·전용 강화 중 하나를 선택하세요.'}</p><div class="upgrade-choices">${combat.choices.map(u=>`<button data-upgrade="${u.id}"><small>${u.scope==='common'?'공용':member.name} · 현재 ${combat.upgrades[u.id]||0} / ${Number.isFinite(u.max)?u.max:'∞'}</small><strong>${u.name}</strong><span>${u.description}</span></button>`).join('')}</div>`,phase);return;
 }
 if(phase==='waiting'){
  overlay(`<p class="eyebrow">STAGE ${combat.stage} CLEAR</p><h2>공세를 막아냈습니다.</h2><p>다음 스테이지에서는 더 강한 적이 나타납니다.<br>현재 강화는 유지되며 방어벽이 최대 5 회복됩니다(상한 ${combat.maxWall}).<br>현재 방어벽 ${combat.wall} / ${combat.maxWall}</p><div class="overlay-actions"><button data-game-action="next">계속하기</button><button class="secondary" data-game-action="stop">그만하기</button></div>`,phase);return;
 }
 if(phase==='ended'){
  const r=combat.result;
  overlay(`<p class="eyebrow">${r.reason==='defeat'?'DEFENSE FALLEN':'DEFENSE COMPLETE'}</p><h2>${r.reason==='defeat'?'방어벽이 무너졌습니다.':'이번 전투를 마쳤습니다.'}</h2><strong class="score-number">${r.score.toLocaleString()}<small> 점</small></strong><p>처치 ${r.kills} · ${seconds(r.seconds)} · 도달 레벨 ${r.level}${r.mode==='stage'?' · 클리어 '+r.cleared+'스테이지':''}</p><p>새 게임에서는 레벨과 강화가 초기화됩니다.</p><div class="overlay-actions"><button data-game-action="restart">다시 시작</button></div>`,phase);return;
 }
 if(phase==='paused'){
  overlay('<p class="eyebrow">PAUSED</p><h2>잠시 쉬어가세요.</h2><div class="overlay-actions"><button data-game-action="resume">전투 재개</button></div>',phase);return;
 }
 overlay(`<p class="eyebrow">${member.en} · THE FIRST DEFENSE</p><h2>${member.name}의 전투를 시작하세요.</h2><p>모드를 고르고 게임 시작을 눌러주세요.</p>`,phase);
}
function aimAt(pointer){if(combat.aimMode!=='manual')return;const angle=Math.atan2(pointer.y-PLAYER.y,Math.max(20,pointer.x-PLAYER.x));combat.aim=Math.max(-1.3,Math.min(1.3,angle));}
async function ensureEngine(){
 if(loading)return loading;
 loading=(async()=>{
  if(!window.Phaser)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='assets/vendor/phaser-3.90.0.min.js';script.onload=resolve;script.onerror=()=>{script.remove();reject(new Error('Phaser load failed'));};document.head.appendChild(script);});
  class DefenseScene extends Phaser.Scene{
   constructor(){super('Defense');}
   preload(){for(const [id,path] of Object.entries(RelicaPresentation.memberAssets))this.load.image('sd-'+id,path);for(const [id,background] of Object.entries(RelicaPresentation.backgrounds))this.load.image('bg-'+id,background.path);}
   create(){
    this.background=this.add.image(0,0,'__MISSING').setOrigin(0).setDepth(-1).setVisible(false);
    this.brush=this.add.graphics();
    // Static frames avoid file:// canvas security restrictions; PNG bytes stay intact.
    for(const [id,frame] of Object.entries(RelicaSDFrames)){
     const key='sd-'+id;if(this.textures.exists(key))this.textures.get(key).add('silhouette',0,frame.x,frame.y,frame.width,frame.height);
    }
    this.sdMember=this.add.image(PLAYER.x,275,'__MISSING').setOrigin(.5,1).setDepth(1).setVisible(false);

    this.caption=this.add.text(22,20,'RELICA / THE FIRST DEFENSE',{fontFamily:'Georgia',fontSize:'10px',color:'#a59cb6',letterSpacing:2});
    this.memberLabel=this.add.text(120,287,'AREN',{fontFamily:'Georgia',fontSize:'11px',color:'#d8b3bd'}).setOrigin(.5).setStroke('#071023',3);
    this.nearLabel=this.add.text(PLAYER.x+10,45,'3칸 · 근거리 100%',{fontFamily:'sans-serif',fontSize:'10px',color:'#be8793'});
    this.farLabel=this.add.text(PLAYER.x+NEAR_DISTANCE+10,45,'거리별 감소 → 50%',{fontFamily:'sans-serif',fontSize:'10px',color:'#94ad9d'});
    this.input.on('pointermove',aimAt);this.input.on('pointerdown',aimAt);
    this.game.canvas.setAttribute('aria-label','디펜스 전투 화면: 왼쪽 방어벽을 지켜주세요. 수동 조준은 마우스 또는 터치로 지정합니다.');
    ready=true;overlayKey='';renderUI();
   }
   update(time,delta){
    pump();if(visible)this.paint(time*clock.speed);
   }
   paint(time){
    const g=this.brush,m=selectedMember(),color=Phaser.Display.Color.HexStringToColor(m.color).color;
    g.clear();
    const theme=RelicaPresentation.backgrounds[m.id],backgroundKey='bg-'+m.id,hasBackground=this.textures.exists(backgroundKey);
    this.background.setVisible(hasBackground);
    if(hasBackground){
     this.background.setTexture(backgroundKey).setDisplaySize(WIDTH,HEIGHT);
     g.fillStyle(0x071023,.12);g.fillRect(0,0,WIDTH,HEIGHT);
     RelicaPresentation.wall(g);this.game.canvas.dataset.background=m.id;
    }else{RelicaPresentation.arena(g,time,reducedMotion.matches);delete this.game.canvas.dataset.background;}
    g.fillStyle(0x071023,.78);g.fillRect(0,0,WIDTH,68);
    this.caption.setText('RELICA / '+theme.title);

    this.nearLabel.setVisible(selected==='aren');this.farLabel.setVisible(selected==='aren');
    if(selected==='aren'){g.fillStyle(0xb86c73,.06);g.fillRect(PLAYER.x,60,NEAR_DISTANCE,HEIGHT-60);g.fillStyle(0x607466,.04);g.fillRect(PLAYER.x+NEAR_DISTANCE,60,WIDTH-PLAYER.x-NEAR_DISTANCE,HEIGHT-60);g.lineStyle(1,0xb86c73,.35);g.lineBetween(PLAYER.x+NEAR_DISTANCE,60,PLAYER.x+NEAR_DISTANCE,HEIGHT);}
    const casting=combat.phase==='running'&&!combat.suspended;
    g.fillStyle(color,.09);g.fillEllipse(120,276,95,21);g.lineStyle(1,color,.4);g.strokeEllipse(120,276,95,21);
    const texture=this.textures.get('sd-'+m.id),hasArt=this.textures.exists('sd-'+m.id)&&texture.has('silhouette');
    this.sdMember.setVisible(hasArt);
    if(hasArt){
     const frame=texture.get('silhouette'),height=104;
     const bob=reducedMotion.matches?0:Math.round(Math.sin(time/330)*(casting?1:.5));
     this.sdMember.setTexture('sd-'+m.id,'silhouette').setDisplaySize(height*frame.width/frame.height,height).setPosition(PLAYER.x,275+bob);
     this.game.canvas.dataset.memberArt=m.id;
    }else{RelicaPresentation.member(g,m,time,casting,combat.aim,reducedMotion.matches);delete this.game.canvas.dataset.memberArt;}
    this.memberLabel.setText(m.en).setColor(m.color).setDepth(2);

    const angle=combat.aim;
    if(combat.aimMode==='manual'){
     g.lineStyle(3,0x071023,.55);g.lineBetween(145,230,120+Math.cos(angle)*145,230+Math.sin(angle)*145);
     g.lineStyle(1,0xe1cfab,.75);g.lineBetween(145,230,120+Math.cos(angle)*145,230+Math.sin(angle)*145);
     const cx=120+Math.cos(angle)*145,cy=230+Math.sin(angle)*145;g.strokeCircle(cx,cy,8);g.lineBetween(cx-12,cy,cx+12,cy);g.lineBetween(cx,cy-12,cx,cy+12);
    }
    for(const e of combat.enemies)RelicaPresentation.enemy(g,e,time,reducedMotion.matches);
    for(const e of combat.enemies){const marks=[e.ice&&0xa7ddee,e.poison&&0x80bd8b,e.burn&&0xed9a63,(e.stun||0)>0&&0xddd38a].filter(Boolean);marks.forEach((c,i)=>{g.fillStyle(c);g.fillCircle(e.x-12+i*6,e.y-e.radius-15,2);});}
    for(const v of combat.effects){const colors={lightning:0xa7b7dd,fire:0xec8c68,shock:0x8e9fff,explosion:0xd8b87d};g.lineStyle(2,colors[v.type]||color,Math.min(1,v.remaining/.22));if(v.to){g.lineBetween(v.x,v.y,v.to.x,v.to.y);}else{g.strokeCircle(v.x,v.y,v.radius);}}
    for(const p of combat.projectiles){const nx=-Math.sin(p.angle),ny=Math.cos(p.angle),r=p.radius;
     if(p.memberId==='elia'){g.lineStyle(2,0xd4c69e);g.lineBetween(p.x-Math.cos(p.angle)*16,p.y-Math.sin(p.angle)*16,p.x,p.y);g.lineBetween(p.x,p.y,p.x-Math.cos(p.angle)*5+nx*4,p.y-Math.sin(p.angle)*5+ny*4);g.lineBetween(p.x,p.y,p.x-Math.cos(p.angle)*5-nx*4,p.y-Math.sin(p.angle)*5-ny*4);continue;}
     if(p.memberId==='selene'){g.fillStyle(0x9189ba,.2);g.fillCircle(p.x,p.y,13);g.fillStyle(0xc8c5d8);g.fillCircle(p.x,p.y,5);continue;}
     if(p.memberId==='noir'){g.lineStyle(3,0xc8c5d8);g.lineBetween(p.x-Math.cos(p.angle)*12,p.y-Math.sin(p.angle)*12,p.x,p.y);g.lineStyle(2,0x4c71d9);g.lineBetween(p.x+nx*4,p.y+ny*4,p.x-nx*4,p.y-ny*4);continue;}
     g.lineStyle(2,color,.75);g.lineBetween(p.x-nx*r,p.y-ny*r,p.x+nx*r,p.y+ny*r);g.lineStyle(5,color,.17);g.lineBetween(p.x-nx*r,p.y-ny*r,p.x+nx*r,p.y+ny*r);
     g.lineStyle(1,0xefe0e8,.85);g.lineBetween(p.x-nx*r*.6+4,p.y-ny*r*.6,p.x+nx*r*.6+4,p.y+ny*r*.6);
    }
   }
  }
  engine=new Phaser.Game({type:Phaser.CANVAS,parent:'phaser-mount',width:WIDTH,height:HEIGHT,backgroundColor:'#10182b',pixelArt:true,antialias:false,loader:{imageLoadType:'HTMLImageElement',crossOrigin:null},audio:{noAudio:true},banner:false,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[DefenseScene]});
 })().catch(()=>{loading=null;text('#game-start','다시 준비하기');$('#game-start').disabled=false;overlay('<h2>게임을 불러오지 못했습니다.</h2><p>다시 준비하기를 누르거나 페이지를 새로고침해 주세요.</p>','error');});
 return loading;
}
$('#game-start').addEventListener('click',()=>{if(!ready){ensureEngine();return;}start();});
$('#game-sound').addEventListener('click',async()=>{await sound.toggle();updateSound();renderUI();});
$('#aim-toggle').addEventListener('click',()=>{combat.toggleAim();renderUI();});
$('#game-speed').addEventListener('click',()=>{pump();clock.speed=clock.speed===1?2:1;renderUI();});
$('#game-pause').addEventListener('click',()=>{if(combat.phase!=='running')return;pump();paused=!paused;clock.reset(performance.now());syncSuspend();renderUI();});
$('#game-stop').addEventListener('click',()=>finish('stopped'));
$$('[data-mode]').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
$('#game-overlay-content').addEventListener('click',event=>{const upgrade=event.target.closest('[data-upgrade]');if(upgrade){combat.chooseUpgrade(upgrade.dataset.upgrade);clock.reset(performance.now());renderUI();return;}const action=event.target.closest('[data-game-action]')?.dataset.gameAction;if(action==='next')combat.nextStage();if(action==='stop')finish('stopped');if(action==='restart')start();if(action==='resume')paused=false;clock.reset(performance.now());syncSuspend();renderUI();});
document.addEventListener('visibilitychange',()=>{pump();if(!document.hidden)engine?.scale.refresh();});
setInterval(()=>{if(ready)pump();},100);
document.addEventListener('relica:account',()=>{if(visible)renderUI();});
window.RelicaDefense={combat,clock,sound,select,show(value){pump();visible=value;syncSuspend();clock.reset(performance.now());if(value){ensureEngine();requestAnimationFrame(()=>engine?.scale.refresh());renderUI();}}};
})();
