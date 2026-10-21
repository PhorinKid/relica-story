(function(root){
'use strict';
// Hand-drawn, temporary pixel silhouettes using the existing member palettes.
// Rendering only: hitboxes, targeting and combat values remain in combat.js.
const sprites={
 aren:[
 '.....hhhhhh.....','....hhhhhshh....','...hhhhhhhhh....','...hhfffffhh....','...hhfefeffh....','...hhffffffh....','...hh.ffw.hh....','..hhsswwwssh....','..hssrwwwrss....','..hssrrwrrss....','..hhrrrrrrrrh...','..hhrrrrrrrrh...','..hhrrssrrssh...','..hhrrrrrrrrh...','...hrrbrrbrrh...','...hrrbrrbrrh...','...hrrbbbbrrh...','...hrrbbbbrrh...','....rrb..brr....','....rbb..bbr....','.....ss..ss.....','.....ss..ss.....','....sss..sss....','....bbb..bbb....'],
 elia:[
 '......whhhh.....','.....whhhhhh....','....hhhhhhhhh...','....hhfffffhh...','....hhfefeffh...','....hhffffffh...','....hh.ff..hh...','....hwwwbwwhh...','....hwwwwwbhh...','...hwwbbbbwwh...','...hwwbbbbwwh...','...hwbbbbbbwh...','...hwwbssbwwh...','....wwbbbbwwh...','....wwwbbwwwh...','....wwwwwwwwh...','.....wwwwwww....','.....bwwwbb.....','.....b...bb.....','.....b...bb.....','.....w...ww.....','.....w...ww.....','....ww...www....','....bb...bbb....'],
 selene:[
 '......shhhh.....','.....hhshhhh....','....hhhhhhhhh...','...hhhhhhhhhh...','...hhhfffffhh...','...hhhfefeffh...','...hhhffffffh...','...hhh.ff.hhh...','...hhwssswhhh...','...hhsrrrshhh...','...hhsrrrshhh...','...hhrrrrrhhh...','...hhrrwrrhhh...','...hhrrsrrhhh...','...hhrrrrrhhh...','...hhrrrrrhhh...','...hhrrrrrhhh...','....rrrtrrrh....','....rrrtrrrr....','...rrrwtrwrrr...','...rrwtttwwrr...','..rrwtttttwwrr..','..rrssssssssrr..','.....bb..bb.....'],
 noir:[
 '.......hhhhh....','.....hhhhhhhh...','....hhhhhhhhhh..','....hhhhhhhhhh..','....hhfffffhhh..','....hhfefefhhh..','....hhfffffhhh..','....hh.ff..hhh..','....hhbssbbhhh..','...hbbbbbsbbhh..','...hbbbbbbbbhh..','...hbbbbsbbbhh..','...hbbbbsbbbbh..','....bbrrrbbbbh..','....bbbbbbbbbh..','....bbbbbrrrhh..','....bbbbbrrrhh..','.....bbbbrrrhh..','.....b.b.rrrhh..','.....b.b..rrhh..','.....b.b...rhh..','.....b.b....hh..','....bb.bb.......','....ss.ss.......']
};
function pixels(g,rows,palette,x,y,unit){rows.forEach((row,dy)=>[...row].forEach((c,dx)=>{if(c!=='.'&&palette[c]!==undefined){g.fillStyle(palette[c]);g.fillRect(Math.round(x+dx*unit),Math.round(y+dy*unit),unit,unit);}}));}
function member(g,m,time,casting,aim,reduced){
 const hex=c=>parseInt(c.slice(1),16),p=m.palette;
 const palette={h:hex({aren:p[0],elia:p[3],selene:p[1],noir:p[3]}[m.id]),r:hex(p[0]),b:hex(p[1]),s:hex(p[2]),w:hex(p[4]),t:hex(p[3]),f:0xe5c3b4,e:hex({aren:p[0],elia:p[1],selene:p[2],noir:p[2]}[m.id])};
 const bob=reduced?0:Math.round(Math.sin(time/340)*(casting?1:0.5));pixels(g,sprites[m.id],palette,96,195+bob,3);
 const handY=230+bob,a=aim+(casting&&!reduced?Math.sin(time/95)*.08:0);
 if(m.id==='aren'){
  g.fillStyle(palette.s);g.fillRect(92,229+bob,15,24);g.fillStyle(palette.r);g.fillRect(95,232+bob,9,18);g.fillStyle(palette.w);g.fillRect(98,235+bob,3,12);
  g.lineStyle(4,palette.s);g.lineBetween(136,handY,136+Math.cos(a)*39,handY+Math.sin(a)*39);g.lineStyle(1,palette.w);g.lineBetween(137,handY-1,136+Math.cos(a)*37,handY+Math.sin(a)*37-1);g.lineStyle(3,palette.r);g.lineBetween(140,handY-6,140,handY+6);
 }else if(m.id==='elia'){
  g.lineStyle(3,palette.s);g.lineBetween(143,handY-22,154,handY);g.lineBetween(154,handY,143,handY+22);g.lineStyle(1,palette.w);g.lineBetween(143,handY-22,143,handY+22);
  g.lineStyle(2,palette.w);g.lineBetween(132,handY,165,handY);g.lineBetween(165,handY,160,handY-3);g.lineBetween(165,handY,160,handY+3);
 }else if(m.id==='selene'){
  g.fillStyle(palette.s);g.fillRect(143,201+bob,3,66);g.fillStyle(palette.w);g.fillRect(140,195+bob,9,9);g.fillStyle(palette.t);g.fillRect(143,192+bob,3,15);g.fillRect(137,198+bob,15,3);
 }else{
  g.fillStyle(palette.s);g.fillRect(91,234+bob,3,15);g.fillRect(88,231+bob,3,9);g.fillStyle(palette.w);g.fillRect(144,224+bob,15,3);g.fillRect(153,221+bob,6,3);g.fillStyle(palette.b);g.fillRect(138,227+bob,9,3);
 }
}
const creatures=[
 ['.....aa.....','....abba....','...abbbba...','..abbbbbba..','.abbbbbbbba.','abbbebbebbba','abbbbbbbbbba','.abbbbbbbba.','..abbbbbba..','...aabba....','....a..a....'],
 ['a..........a','aa...bb...aa','aba.bbbb.aba','abbabbbbabba','.bbbbbbbbbb.','..bbebbebb..','...bbbbbb...','....bbbb....','.....bb.....'],
 ['....aaaa....','...abbbba...','..abbbbbba..','.abbbbbbbba.','abbbbbbbbbba','abbebbebbbba','abbbbbbbbbba','abbbbbbbbbba','.abbbbbbbba.','..aaaaaaaa..']
];
function enemy(g,e,time,reduced){
 const type=e.type??e.id%3,colors=[{a:0x3f506d,b:0x7b8da9,e:0xc9d9e3},{a:0x3b3553,b:0x807092,e:0xe1bfce},{a:0x294e50,b:0x638a87,e:0xd3dbba}][type];
 const unit=Math.max(2,Math.floor(e.radius/6)),rows=creatures[type],width=Math.max(...rows.map(row=>row.length))*unit,bob=reduced?0:Math.round(Math.sin(time/180+e.id)*2);
 g.fillStyle(0x050a15,.45);g.fillEllipse(e.x,e.y+e.radius+6,e.radius*2.3,7);pixels(g,rows,colors,e.x-width/2,e.y-rows.length*unit/2+bob,unit);
 g.fillStyle(0x25223e);g.fillRect(e.x-17,e.y-e.radius-9,34,3);g.fillStyle(0xb286b0);g.fillRect(e.x-17,e.y-e.radius-9,34*Math.max(0,e.hp/e.maxHp),3);
}
function arena(g,time,reduced){
 g.fillStyle(0x0c142a);g.fillRect(0,0,960,460);
 const sky=[0x101930,0x142037,0x19263b];sky.forEach((c,i)=>{g.fillStyle(c);g.fillRect(0,70+i*48,960,48);});
 g.fillStyle(0xc0c4d8,.45);g.fillRect(717,37,24,24);g.fillStyle(0x111b31);g.fillRect(727,32,19,24);
 for(let i=0;i<34;i++){g.fillStyle(0xb6b0d6,.18+i%3*.08);g.fillRect((i*137)%950,25+(i*37)%130,2,2);}
 // Distant ruins and stepped trees are temporary scenery, not additional canon.
 g.fillStyle(0x233046);for(let i=0;i<5;i++){const x=380+i*72;g.fillRect(x,124-(i%3)*16,12,100);g.fillRect(x-3,118-(i%3)*16,18,8);}g.fillRect(377,139,310,6);
 for(let i=0;i<14;i++){const x=175+i*65,h=80+(i*17)%55;g.fillStyle(i%2?0x17283a:0x1a2d3e);g.fillRect(x,240-h,9,h);for(let j=0;j<4;j++)g.fillRect(x-13-j*6,242-h+j*23,35+j*12,25);}
 g.fillStyle(0x152233);g.fillRect(0,276,960,184);
 for(let y=280,row=0;y<460;y+=28,row++)for(let x=-32;x<960;x+=64){const px=x+(row%2)*32;g.fillStyle((row+Math.floor(x/64))%3?0x1b2b3d:0x203044);g.fillRect(px,y,61,25);g.fillStyle(0x8993a0,.045);g.fillRect(px+4,y+2,51,1);}
 g.fillStyle(0x29394c);g.fillRect(0,272,960,5);
 for(const x of [285,620,900]){g.fillStyle(0x3b4359);g.fillRect(x,210,4,61);g.fillStyle(0xab91b9,.35);g.fillRect(x-3,208,10,13);g.fillStyle(0xcdb5cb,.7);g.fillRect(x,211,4,7);}
 for(let i=0;i<12;i++){const alpha=reduced ? 0.16 : 0.12+Math.sin(time/900+i)*0.08;g.fillStyle(0xabc1bb,alpha);g.fillRect(190+(i*79)%750,246+(i*23)%170,2,2);}
 wall(g);
}
function wall(g){
 g.fillStyle(0x4a465b);g.fillRect(43,63,28,343);g.lineStyle(1,0x8d819e,.4);g.strokeRect(43,63,28,343);
 for(let y=64;y<405;y+=22){g.lineBetween(43,y,71,y);g.lineBetween(y%44===20?55:60,y,y%44===20?55:60,y+22);}
 g.fillStyle(0x88778a);g.fillRect(39,54,36,10);g.fillRect(39,405,36,8);
}
class BattleSound{
 constructor(){this.enabled=false;this.available=!!(root.AudioContext||root.webkitAudioContext);this.context=null;this.master=null;this.active=false;this.voices=new Set();this.last=0;try{this.enabled=localStorage.getItem('relica.story.sound.v1')==='true';}catch{}}
 state(){return {enabled:this.enabled,available:this.available,active:this.active,context:this.context?.state||'uninitialized',voices:this.voices.size};}
 async unlock(){
  if(!this.enabled||!this.available)return;
  try{if(!this.context){this.context=new (root.AudioContext||root.webkitAudioContext)();this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(this.context.destination);}if(this.context.state==='suspended')await this.context.resume();this.gate(this.active);}catch{this.available=false;this.enabled=false;}
 }
 async toggle(){this.enabled=!this.enabled;if(this.enabled)await this.unlock();else this.gate(false);try{localStorage.setItem('relica.story.sound.v1',String(this.enabled));}catch{}return this.enabled;}
 gate(active){this.active=!!active;if(this.master)this.master.gain.setValueAtTime(this.active && this.enabled ? 0.12 : 0,this.context.currentTime);}
 play(kind,member='aren'){
  const ctx=this.context;if(!this.active||!this.enabled||!ctx||ctx.state!=='running'||this.voices.size>7)return;
  if(kind==='attack'&&ctx.currentTime-this.last<.085)return;if(kind==='attack')this.last=ctx.currentTime;
  const attack={aren:[180,70,'triangle'],elia:[760,440,'sine'],selene:[420,840,'sine'],noir:[1100,300,'triangle']}[member];
  const notes={attack:[attack[0]],kill:[520],upgrade:[440,554,660],waiting:[523,659,784],ended:[330,260,196],wall:[110]};
  (notes[kind]||[]).forEach((frequency,i)=>{const start=ctx.currentTime+i*.075,duration=kind==='attack'?.07:.13;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=kind==='attack'?attack[2]:'sine';osc.frequency.setValueAtTime(frequency,start);if(kind==='attack')osc.frequency.exponentialRampToValueAtTime(attack[1],start+duration);gain.gain.setValueAtTime(.001,start);gain.gain.exponentialRampToValueAtTime(.32,start+.008);gain.gain.exponentialRampToValueAtTime(.001,start+duration);osc.connect(gain);gain.connect(this.master);this.voices.add(osc);osc.onended=()=>{this.voices.delete(osc);osc.disconnect();gain.disconnect();};osc.start(start);osc.stop(start+duration+.01);});
 }
}
const memberAssets=Object.fromEntries(['aren','elia','selene','noir'].map(id=>[id,'assets/characters/'+id+'-sd-v1.png']));
const backgrounds=Object.fromEntries([["aren",{"title":"황야","path":"assets/backgrounds/aren-background-v1.png"}],["elia",{"title":"숲","path":"assets/backgrounds/elia-background-v1.png"}],["selene",{"title":"호수","path":"assets/backgrounds/selene-background-v1.png"}],["noir",{"title":"밤 도심","path":"assets/backgrounds/noir-background-v1.png"}]]);
root.RelicaPresentation={member,enemy,arena,wall,BattleSound,memberAssets,backgrounds};
})(typeof globalThis!=='undefined'?globalThis:this);
