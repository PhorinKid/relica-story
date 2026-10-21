const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const api=fs.existsSync(__dirname+'/../account.js')?require('../account.js'):{};
test('최고 기록은 줄어들지 않고 최신 테스트 결과를 선택한다',()=>{
 assert.equal(typeof api.mergeProgress,'function');
 const a={stage:5,endless:1000,quiz:{version:1,answers:Array(8).fill(0)},quizUpdatedAt:100};
 const b={stage:2,endless:2000,quiz:{version:1,answers:Array(8).fill(1)},quizUpdatedAt:200};
 const r=api.mergeProgress(a,b);assert.equal(r.stage,5);assert.equal(r.endless,2000);assert.equal(r.quiz.answers[0],1);
 assert.equal(api.mergeProgress(b,a).quiz.answers[0],1);
 assert.equal(api.mergeProgress(a,{stage:-10,endless:'bad',quiz:{version:1,answers:[99]},quizUpdatedAt:999}).quiz.answers[0],0);
});
test('서버 연결 설정에서 비밀 키·위험한 URL을 거부한다',()=>{
 assert.equal(typeof api.validConfig,'function');
 for(const c of [{url:'http://evil.test',key:'sb_publishable_x'}, {url:'https://abc.supabase.co',key:'sb_secret_secret'}, {url:'https://user:pass@abc.supabase.co',key:'sb_publishable_x'}])assert.equal(api.validConfig(c),false);
 const jwt=(role)=>'x.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.x';
 assert.equal(api.validConfig({url:'https://abc.supabase.co',key:jwt('service_role')}),false);
 assert.equal(api.validConfig({url:'https://abc.supabase.co',key:jwt('anon')}),true);
 assert.equal(api.validConfig({url:'https://abc.supabase.co',key:'sb_publishable_test'}),true);
});
test('게스트를 이관한 뒤 계정 전환·로그아웃에 기록이 새지 않는다',async()=>{
 assert.equal(typeof api.ProgressStore,'function');
 const saved=new Map();const storage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};
 const store=new api.ProgressStore({storage});store.setQuiz(Array(8).fill(0));store.setRecords({stage:3,endless:500});
 await store.activate({id:'A'},async data=>data);assert.equal(store.get().stage,3);
 store.setRecords({stage:8,endless:1200});
 await store.activate({id:'B'},async data=>data);assert.equal(store.get().stage,0);assert.equal(store.get().quiz,null);
 await store.activate(null);assert.equal(store.get().stage,0);
 await store.activate({id:'A'},async data=>data);assert.equal(store.get().stage,8);
});
test('통신 실패는 계정별로 보존하고 재시도하며 늦은 응답이 다른 계정을 덮지 않는다',async()=>{
 assert.equal(typeof api.ProgressStore,'function');
 const saved=new Map();const storage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};
 const store=new api.ProgressStore({storage});store.setRecords({stage:4,endless:0});
 await store.activate({id:'A'},async()=>{throw Error('offline');});assert.equal(store.status,'error');assert.equal(store.get().stage,4);
 await store.sync(async data=>({...data,stage:9}));assert.equal(store.get().stage,9);assert.equal(store.status,'synced');
 let finish;const pending=store.sync(()=>new Promise(r=>finish=r));await store.activate({id:'B'},async data=>data);finish({stage:88,endless:0});await pending;assert.equal(store.get().stage,0);
 store.setRecords({stage:12,endless:0},'A');assert.equal(store.get().stage,0);
 await store.activate({id:'A'},async data=>data);assert.equal(store.get().stage,12);
});
test('브라우저 저장이 차단되어도 메모리에서 결과를 유지한다',()=>{
 assert.equal(typeof api.ProgressStore,'function');const store=new api.ProgressStore({storage:{getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}}});
 store.setRecords({stage:2,endless:100});assert.equal(store.get().stage,2);assert.equal(store.localAvailable,false);
});

test('서버 저장 중 추가한 기록은 후속 요청으로 저장된다',async()=>{
 const store=new api.ProgressStore();await store.activate({id:'A'});store.setRecords({stage:1,endless:0});let complete;const sent=[];const pending=store.sync(data=>{sent.push(data.stage);return sent.length===1?new Promise(r=>complete=r):Promise.resolve(data);});store.setRecords({stage:6,endless:0});complete({stage:1,endless:0});await pending;assert.deepEqual(sent,[1,6]);assert.equal(store.get().stage,6);assert.equal(store.status,'synced');
});

test('계정 캐시 저장이 실패하면 서버 성공 전에 게스트 원본을 지우지 않는다',async()=>{
 const saved=new Map([['relica.story.records.v1',JSON.stringify({stage:4,endless:200})]]);const storage={getItem:k=>saved.get(k)||null,setItem(k,v){if(k.includes('.account.'))throw Error('quota');saved.set(k,v);},removeItem:k=>saved.delete(k)};const store=new api.ProgressStore({storage});await store.activate({id:'A'},async()=>{throw Error('offline');});assert(saved.has('relica.story.records.v1'));const reopened=new api.ProgressStore({storage});assert.equal(reopened.get().stage,4);await store.sync(async data=>data);assert.equal(saved.has('relica.story.records.v1'),false);assert.equal(new api.ProgressStore({storage}).get().stage,0);
});
