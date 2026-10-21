const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const api=fs.existsSync(__dirname+'/../combat.js')?require('../combat.js'):{};
function game(mode='stage'){assert.equal(typeof api.Combat,'function','디펜스 전투 모델이 필요합니다.');const g=new api.Combat(()=>0.25);g.start(mode);return g;}
function monster(id,x,y,hp=50){return {id,x,y,hp,maxHp:hp,speed:0,radius:15,damage:1};}
function run(g,seconds){for(let t=0;t<seconds;t+=0.02)g.tick(0.02);}
test('실행 중 자동 발사하고 가까운 적을 먼저 조준한다',()=>{const g=game();g.spawnClock=99;g.enemies=[monster(1,500,100),monster(2,350,230)];g.tick(.02);assert.equal(g.projectiles.length,1);assert.equal(g.projectiles[0].angle,0);});
test('수동 조준에서도 클릭 없이 자동 발사하며 방향이 유지된다',()=>{const g=game();g.spawnClock=99;g.toggleAim();g.aim=Math.PI/4;g.tick(.02);assert.equal(g.projectiles[0].angle,Math.PI/4);g.toggleAim();assert.equal(g.aimMode,'auto');});
test('검기는 관통하고 같은 적에게 중복 피해를 주지 않는다',()=>{const g=game();g.spawnClock=99;g.fireClock=99;g.enemies=[monster(1,220,230,100),monster(2,260,230,100)];g.projectiles=[{x:180,y:230,angle:0,speed:600,travel:60,hit:new Set(),radius:17}];run(g,.2);assert(g.enemies[0].hp<100);assert(g.enemies[1].hp<100);const hp=g.enemies[0].hp;run(g,.1);assert.equal(g.enemies[0].hp,hp);});
test('가까운 검기는 100%, 최대거리 검기는 50% 피해다',()=>{const g=game();assert.equal(g.damageAt(0),40);assert.equal(g.damageAt(840),20);assert.equal(g.damageAt(1600),20);});
test('벽에 도착한 적은 체력을 깎고, 벽 파괴 시 결과 후 판내 강화가 초기화된다',()=>{const g=game();g.fireClock=99;g.spawnClock=99;g.wall=1;g.power=4;g.enemies=[monster(1,70,230)];g.tick(.02);assert.equal(g.phase,'ended');assert.equal(g.result.reason,'defeat');assert.equal(g.result.wall,0);assert.equal(g.power,0);assert.equal(g.enemies.length,0);g.start('stage');assert.equal(g.wall,30);assert.equal(g.level,1);});
test('레벨업 중 전투가 멈추고 서로 다른 3개 중 하나만 강화한다',()=>{const g=game();g.gainExperience(4);assert.equal(g.phase,'upgrade');assert.equal(new Set(g.choices.map(x=>x.id)).size,3);const before=g.elapsed;g.tick(.05);assert.equal(g.elapsed,before);assert.equal(g.chooseUpgrade('invalid'),false);const id=g.choices[0].id;assert.equal(g.chooseUpgrade(id),true);assert.equal(g.phase,'running');assert.equal(g.upgrades[id],1);assert.equal(g.chooseUpgrade(id),false);});
test('회당 출현 상한은 살아있는 적의 총수를 제한하지 않는다',()=>{const g=game('endless');g.kills=999;g.spawnWave();assert.equal(g.enemies.length,16);g.spawnWave();assert.equal(g.enemies.length,32);assert(g.enemies.every(e=>e.hp>50));});
test('스테이지 클리어는 다음 시작을 기다리며 계속하기 전 진행하지 않는다',()=>{const g=game();g.power=2;g.wall=9;g.spawned=g.quota();g.tick(.02);assert.equal(g.phase,'waiting');run(g,2);assert.equal(g.stage,1);assert.equal(g.nextStage(),true);assert.equal(g.stage,2);assert.equal(g.phase,'running');assert.equal(g.wall,14);assert.equal(g.power,2);});
test('무한모드 중단은 점수를 고정하고 새 판을 초기 상태로 시작한다',()=>{const g=game('endless');g.kills=7;g.elapsed=42;g.speedLevel=3;g.finish('stopped');assert.equal(g.result.kills,7);assert.equal(g.result.seconds,42);assert.equal(g.result.score,700);assert.equal(g.speedLevel,0);g.tick(.05);assert.equal(g.result.score,700);g.start('endless');assert.equal(g.kills,0);assert.equal(g.result,null);});
test('페이지나 모달로 일시정지하면 전투 시간과 벽이 변하지 않는다',()=>{const g=game();g.suspended=true;g.enemies=[monster(1,70,230)];g.tick(.05);assert.equal(g.elapsed,0);assert.equal(g.wall,30);g.suspended=false;g.tick(.02);assert.equal(g.wall,29);});
test('최대 강화가 된 효과는 제외하고 남은 유효한 강화만 제공한다',()=>{const g=game();g.upgrades={count:2,speed:5,power:12,area:5,focus:5,ranged:5,experience:5};g.gainExperience(4);assert.equal(g.phase,'upgrade');assert.deepEqual(g.choices.map(x=>x.id),['power']);});

test('검기는 기본 판정 범위가 기존의 2배다',()=>{const g=game();g.aimMode='manual';g.fire();assert.equal(g.projectiles[0].radius,34);});
test('아렌 앞 3칸은 피해 100%이고 그 뒤부터 화면 끝 50%로 감소한다',()=>{const g=game();assert.equal(g.damageAt(64),40);assert.equal(g.damageAt(192),40);assert.equal(g.damageAt(516),30);assert.equal(g.damageAt(840),20);});
test('근거리 집중은 초록 구간의 피해를 바꾸지 않고 공격력은 전 구간에 적용된다',()=>{const g=game();g.focus=2;assert.equal(g.damageAt(192),80);assert.equal(g.damageAt(516),30);assert.equal(g.damageAt(840),20);g.power=1;assert.equal(g.damageAt(516),36);});
test('실제 명중 피해는 대각선 길이가 아니라 이미지처럼 가로 구간으로 계산한다',()=>{const g=game();g.spawnClock=99;g.fireClock=99;g.enemies=[monster(1,300,400,100)];g.projectiles=[{x:270,y:400,angle:0,speed:600,travel:150,hit:new Set(),radius:34}];g.tick(.02);assert.equal(g.enemies[0].hp,60);});
test('추가 검기는 시간차로 같은 방향에 나가고 추가 2회에서 최대 3발이다',()=>{const g=game();g.aimMode='manual';g.aim=.2;g.count=2;g.spawnClock=99;g.fireClock=99;g.fire();assert.equal(g.projectiles.length,1);g.aim=1;run(g,.13);assert.equal(g.projectiles.length,2);run(g,.13);assert.equal(g.projectiles.length,3);assert(g.projectiles.every(p=>p.angle===.2));run(g,.13);assert.equal(g.projectiles.length,3);});
test('검기 수가 1/2/3일 때 각 명중 피해는 100/85/70%다',()=>{for(const [count,wantHp] of [[0,60],[1,66],[2,72]]){const g=game();g.count=count;g.aimMode='manual';g.spawnClock=99;g.fireClock=99;g.enemies=[monster(1,150,230,100)];g.fire();g.tick(.02);assert.equal(g.enemies[0].hp,wantHp);}});
test('경험치 강화는 단계당 10%이고 최대 50%다',()=>{for(const [rank,wantXp]of [[0,2],[1,2.2],[5,3],[9,3]]){const g=game();g.experienceLevel=rank;g.gainExperience(2);assert.equal(g.xp,wantXp);}});
function clockGame(){const g=game('endless');g.spawnClock=99;g.fireClock=99;assert.equal(typeof api.SimulationClock,'function','누락 시간과 2배속을 처리할 전투 시계가 필요합니다.');return {g,c:new api.SimulationClock(g)};}
function drain(c,now){for(let i=0;i<40&&c.pending>1e-8;i++)c.pulse(now);}
test('전투 시계는 2배속에서도 잘린 프레임 없이 정확히 두 배를 진행한다',()=>{const {g,c}=clockGame();c.speed=2;c.pulse(0);c.pulse(1000);drain(c,1000);assert(Math.abs(g.elapsed-2)<1e-8);c.pulse(1000);assert(Math.abs(g.elapsed-2)<1e-8);});
test('최소화로 콜백이 늦어져도 누락된 시간을 나누어 따라잡는다',()=>{const {g,c}=clockGame();c.pulse(0);c.pulse(5000);assert(g.elapsed<=.251);assert(c.pending>4);drain(c,5000);assert(Math.abs(g.elapsed-5)<1e-8);});
test('강화 선택과 대기 중인 시간은 복귀 이후 한꺼번에 진행하지 않는다',()=>{const {g,c}=clockGame();c.pulse(0);g.gainExperience(4);c.pulse(5000);g.chooseUpgrade(g.choices[0].id);c.pulse(5100);assert(Math.abs(g.elapsed-.1)<1e-8);g.suspended=true;c.pulse(10000);g.suspended=false;c.pulse(10100);assert(Math.abs(g.elapsed-.2)<1e-8);});

test('자동 조준은 캐릭터보다 방어벽 직선에 가까운 적을 먼저 노린다',()=>{const g=game();g.enemies=[monster(1,200,440),monster(2,220,230)];g.fire();assert.equal(g.projectiles[0].angle,Math.atan2(210,80));});
test('처치 경험치는 마지막 피해가 아닌 몬스터 최대 체력에 비례한다',()=>{for(const [hp,want]of [[34,1],[68,2],[102,3]]){const g=game();g.spawnClock=99;g.fireClock=99;const e=monster(1,500,230,hp);e.hp=0;g.enemies=[e];g.tick(.02);assert.equal(g.kills,1);assert.equal(g.xp,want);}});
test('체력 비례 경험치에 경험치 강화 배율을 추가 적용한다',()=>{const g=game();g.experienceLevel=5;g.spawnClock=99;g.fireClock=99;const e=monster(1,500,230,68);e.hp=0;g.enemies=[e];g.tick(.02);assert.equal(g.xp,3);});
test('높은 체력의 처치 보상이 여러 레벨에 걸쳐도 경험치가 사라지지 않는다',()=>{const g=game();g.spawnClock=99;g.fireClock=99;const e=monster(1,500,230,340);e.hp=0;g.enemies=[e];g.tick(.02);assert.equal(g.level,2);assert.equal(g.xp,6);g.chooseUpgrade(g.choices[0].id);assert.equal(g.level,3);assert.equal(g.xp,0);assert.equal(g.phase,'upgrade');});
test('방어벽 체력은 30으로 시작하고 강한 몬스터도 접촉 피해는 1이다',()=>{const g=game();assert.equal(g.wall,30);g.fireClock=99;g.spawnClock=99;g.enemies=[{...monster(1,70,230,340),damage:999}];g.tick(.02);assert.equal(g.wall,29);assert.equal(g.xp,0);});
test('스테이지 클리어 순간 5를 회복하며 대기와 계속하기는 중복 회복하지 않는다',()=>{const g=game();g.wall=10;g.spawned=g.quota();g.tick(.02);assert.equal(g.phase,'waiting');assert.equal(g.wall,15);run(g,1);assert.equal(g.wall,15);g.nextStage();assert.equal(g.wall,15);});
test('스테이지 회복은 최대 30이며 무한 모드에는 클리어 회복이 없다',()=>{const g=game();g.wall=28;g.spawned=g.quota();g.tick(.02);assert.equal(g.wall,30);const endless=game('endless');endless.wall=7;endless.spawnClock=99;endless.tick(.02);assert.equal(endless.wall,7);});

test('몬스터 외형 종류마다 기본 체력과 이동속도가 다르며 난이도 상승 후에도 구분된다',()=>{
 for(const mode of ['stage','endless'])for(const tier of [0,3]){
  const g=game(mode);if(mode==='stage')g.stage=tier+1;else g.kills=tier*12;
  for(let i=0;i<3;i++)g.spawnWave();
  const seen=new Map(g.enemies.map(e=>[e.type,e]));assert.equal(seen.size,3);
  for(const [type,hp,speed]of [[0,34,26],[1,22,38],[2,56,18]]){
   const e=seen.get(type);assert(e);assert.equal(e.hp,Math.round(hp*(1+.22*tier)));assert.equal(e.maxHp,e.hp);assert.equal(e.speed,speed+Math.min(tier,30)*1.3);assert.equal(e.damage,1);
  }
 }
});
test('외형별 체력 차이도 처치 경험치에 반영한다',()=>{
 const g=game('endless');g.fireClock=99;for(let i=0;i<3;i++)g.spawnWave();g.spawnClock=99;
 const hp=g.enemies.reduce((sum,e)=>sum+e.maxHp,0);g.enemies.forEach(e=>e.hp=0);g.tick(.02);
 assert(Math.abs(g.xp-hp/34)<1e-8);assert.equal(g.kills,3);
});
test('무한 모드는 10킬마다 회당 출현이 증가하고 150킬부터 16마리로 유지된다',()=>{
 const g=game('endless');for(const [kills,size]of [[0,1],[9,1],[10,2],[49,5],[50,6],[149,15],[150,16],[9999,16]]){g.kills=kills;assert.equal(g.batchSize(),size);}
 const stage=game('stage');stage.stage=99;assert.equal(stage.batchSize(),6);
});
test('무한 모드는 첫 묶음을 2초에 출현시키고 이후 2초마다 현재 처치 수에 맞는 묶음을 출현시킨다',()=>{
 const g=game('endless');g.fireClock=999;
 for(let i=0;i<99;i++)g.tick(.02);assert.equal(g.spawned,0);
 g.tick(.02);assert.equal(g.spawned,1);
 g.kills=150;for(let i=0;i<99;i++)g.tick(.02);assert.equal(g.spawned,1);
 g.tick(.02);assert.equal(g.spawned,17);assert.equal(g.enemies.length,17);
 for(let i=0;i<100;i++)g.tick(.02);assert.equal(g.spawned,33);assert.equal(g.enemies.length,33);
});
test('무한 모드 2배속에서는 실제 1초마다 한 묶음 출현한다',()=>{
 const g=game('endless'),clock=new api.SimulationClock(g);g.fireClock=999;clock.speed=2;clock.reset(0);
 for(let i=1;i<=99;i++)clock.pulse(i*10);assert.equal(g.spawned,0);
 clock.pulse(1000);assert.equal(g.spawned,1);
 for(let i=101;i<=200;i++)clock.pulse(i*10);assert.equal(g.spawned,2);
});
