(function(root){
'use strict';
const WIDTH=960,HEIGHT=460,PLAYER={x:120,y:230},WALL_X=74,GRID=64;
const NEAR_DISTANCE=GRID*3,FAR_DISTANCE=WIDTH-PLAYER.x,BURST_GAP=.12;
const BASE_ENEMY_HP=34,WALL_MAX_HP=30,ENDLESS_WALL_HP=50,WALL_HIT_DAMAGE=1,STAGE_HEAL=5;
const ENEMY_TYPES=[{name:'결정형',hp:34,speed:26},{name:'박쥐형',hp:22,speed:38},{name:'슬라임형',hp:56,speed:18}];
const MEMBERS={aren:{damage:40,interval:.75,speed:600,radius:34},elia:{damage:40,interval:.6,speed:700,radius:5},selene:{damage:30,interval:.8,speed:650,radius:8},noir:{damage:25,interval:.55,speed:750,radius:6}};
// 미지정된 범위 수치는 메모장에 임시값으로 구분해 기록합니다.
const TUNING={arrowJumpRange:Infinity,arrowBlastBase:12,arrowBlastPerLevel:12,fireBlastBase:24,fireBlastPerStack:12,shockRadius:84,fanStep:.06,daggerFanStep:.12};
const U=(id,name,description,max,scope='common')=>({id,name,description,max,scope});
const upgrades=[
 U('power','공격력 강화','기본 공격력 +20%',Infinity),U('speed','빠른 공격','발사 간격 ×88% · 최대 5단계',5),U('count','연속 공격','같은 방향 +1회 · 발당 피해 -15%p',2),U('experience','경험치 증가','경험치 +10% · 최대 +50%',5),
 U('area','넓은 검기','검기 기본 범위 +30%',5,'aren'),U('focus','근접 강화','앞 3칸 피해 +50%',5,'aren'),U('ranged','원거리 강화','3칸 이후 피해 +40%',5,'aren'),
 U('fan','다중 발사','부채꼴로 화살 2발 추가',5,'elia'),U('ricochet','튕기는 화살','추가 타겟 +1 · 전이 피해 감소 완화',5,'elia'),U('penetration','관통 화살','관통 +1 · 관통 피해 감소 완화',5,'elia'),U('explosive','폭발 화살','항상 폭발 · 타격 피해의 단계당 10% · 최대 50%',5,'elia'),
 U('lightning','체인 라이트닝','체인 +1 · 마비 확률 +10%',5,'selene'),U('ice','얼음','10초 둔화 · 15% + 단계당 5%',5,'selene'),U('fire','불','화상: 단계당 초당 피해 10% · 3중첩',5,'selene'),
 U('poison','독','확률 +20% · 둔화 +10% · 최대 체력 피해 +2%',5,'noir'),U('daggerFan','다중 발사','부채꼴로 단검 2발 추가 · 간격 0.12라디안',5,'noir'),U('shock','전기','주변 피해 +10% · 마비 0.5초',5,'noir')
];
function segmentDistance(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,d=dx*dx+dy*dy;const t=d?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/d)):0;return Math.hypot(px-ax-t*dx,py-ay-t*dy);}
class Combat{
 constructor(random=Math.random){this.random=random;this.mode='stage';this.memberId='aren';this.reset();this.phase='ready';this.result=null;}
 get maxWall(){return this.mode==='endless'?ENDLESS_WALL_HP:WALL_MAX_HP;}
 get stats(){return MEMBERS[this.memberId]||MEMBERS.aren;}
 reset(){this.stage=1;this.wall=this.maxWall;this.kills=0;this.level=1;this.xp=0;this.elapsed=0;this.spawned=0;this.spawnClock=this.mode==='endless'?2:.3;this.fireClock=0;this.power=0;this.speedLevel=0;this.count=0;this.area=0;this.focus=0;this.ranged=0;this.experienceLevel=0;this.aimMode='auto';this.aim=0;this.enemies=[];this.projectiles=[];this.pendingShots=[];this.choices=[];this.upgrades={};this.serial=0;this.suspended=false;this.effects=[];}
 start(mode='stage',memberId='aren'){this.mode=mode==='endless'?'endless':'stage';this.memberId=MEMBERS[memberId]?memberId:'aren';this.reset();this.result=null;this.phase='running';}
 rank(id){return this.upgrades[id]||0;}
 availableUpgrades(){return upgrades.filter(u=>(u.scope==='common'||u.scope===this.memberId)&&this.rank(u.id)<u.max&&!(u.id==='ricochet'&&this.rank('penetration'))&&!(u.id==='penetration'&&this.rank('ricochet')));}
 quota(){return 8+4*(this.stage-1);}
 xpNeeded(){return Math.ceil(4*Math.pow(1.3,this.level-1));}
 difficulty(){return this.mode==='endless'?Math.floor(this.kills/12):this.stage-1;}
 spawnInterval(){return this.mode==='endless'?2:2.3;}batchLimit(){return this.mode==='endless'?16:6;}batchSize(){return Math.min(this.batchLimit(),1+Math.floor(this.mode==='endless'?this.kills/10:(this.stage-1)/2));}
 attackInterval(){return this.stats.interval*Math.pow(.88,Math.min(5,this.speedLevel));}
 damageAt(distance,shot={}){const id=shot.memberId||this.memberId,power=shot.power??this.power;let damage=MEMBERS[id].damage*(1+.2*power)*(shot.multiplier??1);if(id==='aren'){const ratio=Math.max(0,Math.min(1,(distance-NEAR_DISTANCE)/(FAR_DISTANCE-NEAR_DISTANCE)));damage*=1-.5*ratio;damage*=distance<=NEAR_DISTANCE?1+.5*(shot.focus??this.focus):1+.4*(shot.ranged??this.ranged);}return damage;}
 toggleAim(){this.aimMode=this.aimMode==='auto'?'manual':'auto';}
 spawnWave(){const tier=this.difficulty();let n=this.batchSize();if(this.mode==='stage')n=Math.min(n,this.quota()-this.spawned);for(let i=0;i<n;i++){const id=++this.serial,type=id%ENEMY_TYPES.length,stats=ENEMY_TYPES[type],hp=Math.round(stats.hp*(1+.22*tier));this.enemies.push({id,type,x:WIDTH+15+i*12,y:65+this.random()*(HEIGHT-130),hp,maxHp:hp,speed:stats.speed+Math.min(tier,30)*1.3,radius:14+Math.min(tier,5),damage:1});this.spawned++;}}
 emit(shot){const s=MEMBERS[shot.memberId||this.memberId];this.projectiles.push({...shot,x:PLAYER.x,y:PLAYER.y,speed:s.speed,travel:0,hit:new Set(),hitsLeft:shot.memberId==='elia'?1+(shot.skills.penetration||0):shot.memberId==='selene'?1:Infinity,jumpsLeft:shot.skills?.ricochet||0,bouncesLeft:shot.memberId==='noir'?2:0});}
 fire(){if(this.aimMode==='auto'){let target=null,nearest=Infinity;for(const e of this.enemies){const distance=e.x-WALL_X;if(e.hp>0&&distance>0&&distance<nearest){target=e;nearest=distance;}}if(!target)return;this.aim=Math.atan2(target.y-PLAYER.y,target.x-PLAYER.x);}
  const additional=Math.max(0,Math.min(2,this.count)),fan=this.memberId==='elia'?this.rank('fan'):this.memberId==='noir'?this.rank('daggerFan'):0;
  const fanStep=this.memberId==='noir'?TUNING.daggerFanStep:TUNING.fanStep;
  const base={memberId:this.memberId,multiplier:1-.15*additional,power:this.power,focus:this.focus,ranged:this.ranged,skills:{...this.upgrades},radius:this.stats.radius*(this.memberId==='aren'?1+.3*this.area:1)};
  for(let j=-fan;j<=fan;j++){const shot={...base,angle:this.aim+j*fanStep};this.emit(shot);for(let i=1;i<=additional;i++)this.pendingShots.push({wait:BURST_GAP*i,shot:{...shot}});}
 }
 gainExperience(amount){this.xp+=amount*(1+.1*Math.max(0,Math.min(5,this.experienceLevel)));this.checkLevel();}
 checkLevel(){if(this.phase!=='running'||this.xp+1e-9<this.xpNeeded())return;this.xp=Math.max(0,this.xp-this.xpNeeded());this.level++;const pool=this.availableUpgrades();for(let i=pool.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}this.choices=pool.slice(0,3);if(this.choices.length)this.phase='upgrade';}
 chooseUpgrade(id){const option=this.choices.find(c=>c.id===id);if(this.phase!=='upgrade'||!option||!this.availableUpgrades().some(u=>u.id===id))return false;this.upgrades[id]=this.rank(id)+1;const fields={power:'power',speed:'speedLevel',count:'count',area:'area',focus:'focus',ranged:'ranged',experience:'experienceLevel'};if(fields[id])this[fields[id]]=this.upgrades[id];this.choices=[];this.phase='running';this.checkLevel();return true;}
 nextStage(){if(this.phase!=='waiting')return false;this.stage++;this.spawned=0;this.spawnClock=.5;this.fireClock=0;this.projectiles=[];this.pendingShots=[];this.effects=[];this.phase='running';return true;}
 finish(reason='stopped'){if(!['running','upgrade','waiting'].includes(this.phase))return false;const summary={reason,memberId:this.memberId,mode:this.mode,kills:this.kills,seconds:Math.floor(this.elapsed),stage:this.stage,cleared:this.phase==='waiting'?this.stage:this.stage-1,level:this.level,score:this.kills*100,wall:Math.max(0,this.wall)};this.reset();this.result=Object.freeze(summary);this.phase='ended';return true;}
 nearest(from,filter=()=>true){let best=null,d=Infinity;for(const e of this.enemies){if(e.hp<=0||!filter(e))continue;const distance=Math.hypot(e.x-from.x,e.y-from.y);if(distance<d){best=e;d=distance;}}return best;}
 visual(type,x,y,radius=0,to=null){this.effects.push({type,x,y,radius,to:to?{x:to.x,y:to.y}:null,remaining:.22});}
 addStack(e,key,dps,duration){const value=e[key]||{stacks:[],remaining:0};if(value.stacks.length<3)value.stacks.push(dps);value.remaining=duration;e[key]=value;}
 burn(e,damage,rank){if(rank>0)this.addStack(e,'burn',damage*.1*rank,5);}
 mageEffects(e,damage,skills){if(skills.ice)e.ice={slow:Math.min(.4,.15+.05*skills.ice),remaining:10};if(skills.lightning&&this.random()<Math.min(.5,.1*skills.lightning))e.stun=Math.max(e.stun||0,.5);if(skills.fire){const oldStacks=e.burn?.stacks.length||0;this.burn(e,damage,skills.fire);if(oldStacks){const radius=TUNING.fireBlastBase+oldStacks*TUNING.fireBlastPerStack;this.visual('fire',e.x,e.y,radius);for(const other of this.enemies){if(other===e||other.hp<=0||Math.hypot(other.x-e.x,other.y-e.y)>radius)continue;other.hp-=damage;this.burn(other,damage,skills.fire);}}}}
 impact(p,e){const id=p.memberId||this.memberId,skills=p.skills||{},damage=this.damageAt(e.x-PLAYER.x,p);e.hp-=damage;
  if(id==='elia'&&skills.explosive){const radius=TUNING.arrowBlastBase+TUNING.arrowBlastPerLevel*skills.explosive;this.visual('explosion',e.x,e.y,radius);for(const other of this.enemies)if(other!==e&&other.hp>0&&Math.hypot(other.x-e.x,other.y-e.y)<=radius)other.hp-=damage*.1*skills.explosive;}
  if(id==='selene'){this.mageEffects(e,damage,skills);if(skills.lightning){const visited=new Set([e.id]);let from=e,chainDamage=damage;for(let i=0;i<skills.lightning;i++){let next=this.nearest(from,t=>!visited.has(t.id));if(!next)next=this.nearest(from,t=>t!==from)||this.nearest(from);if(!next)break;chainDamage*=.85;this.visual('lightning',from.x,from.y,0,next);next.hp-=chainDamage;visited.add(next.id);this.mageEffects(next,chainDamage,skills);from=next;}}}
  if(id==='noir'){
   if(skills.poison&&this.random()<skills.poison*.2)e.poison={remaining:5,slow:Math.min(.5,.1*skills.poison),dps:e.maxHp*.02*skills.poison/5};
   if(skills.shock){e.stun=Math.max(e.stun||0,.5);this.visual('shock',e.x,e.y,TUNING.shockRadius);for(const other of this.enemies)if(other!==e&&other.hp>0&&Math.hypot(other.x-e.x,other.y-e.y)<=TUNING.shockRadius){other.hp-=damage*.1*skills.shock;other.stun=Math.max(other.stun||0,.5);}}
  }
 }
 statusStep(e,dt){let slow=0,stunned=Math.min(dt,e.stun||0);e.stun=Math.max(0,(e.stun||0)-dt);for(const key of ['ice','poison','burn']){const s=e[key];if(!s||s.remaining<=0)continue;const active=Math.min(dt,s.remaining);if(key==='ice'||key==='poison')slow=Math.max(slow,s.slow*active/dt);if(key==='poison')e.hp-=s.dps*active;if(key==='burn')e.hp-=s.stacks.reduce((sum,d)=>sum+d,0)*active;s.remaining=Math.max(0,s.remaining-dt);if(s.remaining<=1e-8)delete e[key];}return Math.max(0,dt-stunned)*(1-slow);}
 projectileStep(p,dt){const id=p.memberId||this.memberId,ox=p.x,oy=p.y,length=p.speed*dt;p.x+=Math.cos(p.angle)*length;p.y+=Math.sin(p.angle)*length;p.travel+=length;const dx=p.x-ox,dy=p.y-oy;
  const targets=this.enemies.filter(e=>e.hp>0&&!p.hit.has(e.id)&&segmentDistance(e.x,e.y,ox,oy,p.x,p.y)<=p.radius+e.radius).sort((a,b)=>((a.x-ox)*dx+(a.y-oy)*dy)-((b.x-ox)*dx+(b.y-oy)*dy));
  for(const e of targets){if(e.hp<=0)continue;p.hit.add(e.id);this.impact(p,e);
   if(id==='elia'&&p.jumpsLeft>0){const next=this.nearest(e,t=>!p.hit.has(t.id));p.jumpsLeft--;if(next){p.multiplier*=1-(.25-.05*p.skills.ricochet);p.x=e.x;p.y=e.y;p.angle=Math.atan2(next.y-e.y,next.x-e.x);return;}p.dead=true;break;}
   if(id==='elia'||id==='selene'){p.hitsLeft=(p.hitsLeft??1)-1;if(p.hitsLeft<=0){p.dead=true;break;}if(id==='elia'&&p.skills?.penetration)p.multiplier*=1-(.25-.05*p.skills.penetration);}
  }
  if(id==='noir'&&!p.dead){const left=WALL_X+p.radius,right=WIDTH-p.radius,top=60+p.radius,bottom=HEIGHT-15-p.radius;let bounced=false;if(p.x<=left||p.x>=right){p.x=Math.max(left,Math.min(right,p.x));p.angle=Math.PI-p.angle;bounced=true;}if(p.y<=top||p.y>=bottom){p.y=Math.max(top,Math.min(bottom,p.y));p.angle=-p.angle;bounced=true;}if(bounced){if(p.bouncesLeft<=0)p.dead=true;else{p.bouncesLeft--;p.multiplier*=.7;p.hit.clear();}}}
  else if(p.x< -80||p.x>WIDTH+80||p.y< -80||p.y>HEIGHT+80||p.travel>1400)p.dead=true;
 }
 tick(seconds){if(this.phase!=='running'||this.suspended)return;const dt=Math.max(0,Math.min(.05,seconds));if(!dt)return;this.elapsed+=dt;this.effects=this.effects.filter(v=>(v.remaining-=dt)>0);
  const moves=new Map();for(const e of this.enemies)moves.set(e.id,this.statusStep(e,dt));
  this.spawnClock-=dt;if(this.spawnClock<=1e-9&&(this.mode==='endless'||this.spawned<this.quota())){this.spawnWave();this.spawnClock=this.spawnInterval();}
  this.pendingShots=this.pendingShots.filter(p=>{p.wait-=dt;if(p.wait<=1e-9){this.emit(p.shot);return false;}return true;});
  this.fireClock-=dt;if(this.fireClock<=0){this.fire();this.fireClock=this.attackInterval();}
  for(const p of this.projectiles)this.projectileStep(p,dt);this.projectiles=this.projectiles.filter(p=>!p.dead);
  let defeated=0,earnedExperience=0;this.enemies=this.enemies.filter(e=>{if(e.hp<=0){defeated++;earnedExperience+=e.maxHp/BASE_ENEMY_HP;return false;}return true;});
  if(defeated){this.kills+=defeated;this.gainExperience(earnedExperience);if(this.phase==='upgrade')return;}
  for(const e of this.enemies)e.x-=e.speed*((e.stun||0)>0?0:Math.min(moves.get(e.id)??dt,dt));
  this.enemies=this.enemies.filter(e=>{if(e.x<=WALL_X){this.wall=Math.max(0,this.wall-WALL_HIT_DAMAGE);return false;}return true;});
  if(this.wall<=0){this.finish('defeat');return;}
  if(this.mode==='stage'&&this.spawned>=this.quota()&&!this.enemies.length){this.wall=Math.min(this.maxWall,this.wall+STAGE_HEAL);this.phase='waiting';this.projectiles=[];this.pendingShots=[];this.effects=[];}
 }
}
class SimulationClock{constructor(combat){this.combat=combat;this.speed=1;this.lastTime=null;this.pending=0;}reset(now){this.lastTime=now;this.pending=0;}pulse(now){if(!Number.isFinite(now))return;if(this.lastTime===null){this.lastTime=now;return;}const elapsed=Math.max(0,(now-this.lastTime)/1000);this.lastTime=now;if(this.combat.phase!=='running'||this.combat.suspended){this.pending=0;return;}this.pending+=elapsed*(this.speed===2?2:1);let budget=.25;while(this.pending>1e-9&&budget>1e-9&&this.combat.phase==='running'&&!this.combat.suspended){const step=Math.min(.02,this.pending,budget);this.combat.tick(step);this.pending=Math.max(0,this.pending-step);budget-=step;}if(this.combat.phase!=='running'||this.combat.suspended)this.pending=0;}}
const api={Combat,SimulationClock,WIDTH,HEIGHT,PLAYER,WALL_X,GRID,NEAR_DISTANCE,FAR_DISTANCE,BASE_ENEMY_HP,WALL_MAX_HP,ENDLESS_WALL_HP,WALL_HIT_DAMAGE,STAGE_HEAL,ENEMY_TYPES,MEMBERS,TUNING,upgrades};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RelicaCombat=api;
})(typeof globalThis!=='undefined'?globalThis:this);
