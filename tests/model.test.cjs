const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const modulePath=path.join(__dirname,'../model.js');
const api=fs.existsSync(modulePath)?require(modulePath):{};
test('입장 전에는 내부 경로를 열지 않고 입장 후 이동할 수 있다',()=>{
 assert.equal(typeof api.transition,'function','입장 및 페이지 전환 기능이 필요합니다.');
 const start={entered:false,page:'home'};
 assert.deepEqual(api.transition(start,{type:'navigate',page:'game'}),start);
 const entered=api.transition(start,{type:'enter'});
 assert.deepEqual(entered,{entered:true,page:'home'});
 assert.deepEqual(api.transition(entered,{type:'navigate',page:'game'}),{entered:true,page:'game'});
 assert.deepEqual(api.transition(entered,{type:'navigate',page:'unknown'}),entered);
});
test('멤버 선택이 실제 브랜드 정보와 색상 팔레트를 반환한다',()=>{
 assert.equal(typeof api.getMember,'function','멤버 정보 기능이 필요합니다.');
 assert.equal(api.getMember('aren').name,'아렌');
 assert.equal(api.getMember('elia').role,'메인보컬');
 assert.equal(api.getMember('selene').palette[0],'#4E4B78');
 assert.equal(api.getMember('noir').className,'암살자');
 assert.equal(api.getMember('invalid'),null);
});
