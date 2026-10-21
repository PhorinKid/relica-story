(function(root){
'use strict';
const model=typeof module!=='undefined'&&module.exports?require('./model.js'):root.Relica;
const EMPTY=()=>({stage:0,endless:0,quiz:null,quizUpdatedAt:0});
const clone=data=>JSON.parse(JSON.stringify(data));
function normalize(value){
 const out=EMPTY();if(!value||typeof value!=='object')return out;
 for(const key of ['stage','endless'])if(Number.isSafeInteger(value[key])&&value[key]>=0&&value[key]<=(key==='stage'?1000000:1000000000000))out[key]=value[key];
 if(value.quiz&&model.restoreQuiz(JSON.stringify(value.quiz))){out.quiz={version:1,answers:[...value.quiz.answers]};out.quizUpdatedAt=Number.isSafeInteger(value.quizUpdatedAt)&&value.quizUpdatedAt>=0?value.quizUpdatedAt:0;}
 return out;
}
function mergeProgress(left,right){
 const a=normalize(left),b=normalize(right);const recent=b.quiz&&(!a.quiz||b.quizUpdatedAt>a.quizUpdatedAt)?b:a;
 return {stage:Math.max(a.stage,b.stage),endless:Math.max(a.endless,b.endless),quiz:recent.quiz,quizUpdatedAt:recent.quizUpdatedAt};
}
function validConfig(config){
 try{
  const url=new URL(config.url);if(url.protocol!=='https:'||url.username||url.password||url.port||url.pathname!=='/'||url.search||url.hash||!url.hostname.endsWith('.supabase.co'))return false;
  if(typeof config.key!=='string')return false;
  if(/^sb_publishable_[a-zA-Z0-9_-]+$/.test(config.key))return true;
  const part=config.key.split('.')[1];if(!part)return false;
  const decoded=typeof Buffer!=='undefined'?Buffer.from(part,'base64url').toString():atob(part.replace(/-/g,'+').replace(/_/g,'/'));
  return JSON.parse(decoded).role==='anon';
 }catch{return false;}
}
class ProgressStore{
 constructor({storage,onChange=()=>{}}={}){
  this.storage=storage;this.onChange=onChange;this.owner='guest';this.status='guest';this.localAvailable=!!storage;this.epoch=0;this.revision=0;this.cache=new Map();this.pending=new Map();this.importing=new Set();
  let data=this.read('guest');
  // One-time compatibility with the first prototype's two guest keys.
  if(!this.raw('relica.story.guest.v2')){
   try{const oldRecords=JSON.parse(this.raw('relica.story.records.v1')||'null');const oldQuiz=model.restoreQuiz(this.raw('relica.story.quiz.v1'));data=mergeProgress(oldRecords,{quiz:oldQuiz?{version:1,answers:oldQuiz.answers}:null,quizUpdatedAt:oldQuiz?Date.now():0});}catch{}
  }
  this.cache.set('guest',data);
 }
 key(owner){return owner==='guest'?'relica.story.guest.v2':'relica.story.account.'+owner+'.v1';}
 raw(key){try{return this.storage?.getItem(key)||null;}catch{this.localAvailable=false;return null;}}
 read(owner){try{return normalize(JSON.parse(this.raw(this.key(owner))||'null'));}catch{return EMPTY();}}
 get(owner=this.owner){if(!this.cache.has(owner))this.cache.set(owner,this.read(owner));return clone(this.cache.get(owner));}
 persist(owner){try{if(!this.storage)throw Error();this.storage.setItem(this.key(owner),JSON.stringify(this.get(owner)));return true;}catch{this.localAvailable=false;return false;}}
 notify(kind='status'){this.onChange(kind);}
 write(data,owner=this.owner){this.cache.set(owner,normalize(data));this.persist(owner);this.revision++;if(owner===this.owner){if(owner!=='guest')this.status='pending';this.notify('local');}}
 setRecords(records,owner=this.owner){this.write(mergeProgress(this.get(owner),records),owner);}
 setQuiz(answers){if(!model.scoreQuiz(answers))return false;this.write({...this.get(),quiz:{version:1,answers:[...answers]},quizUpdatedAt:Date.now()});return true;}
 async activate(user,remote){
  const next=user?.id||'guest';if(next!==this.owner){this.owner=next;this.epoch++;this.revision++;}
  if(next==='guest'){this.status='guest';this.notify('identity');return;}
  const guest=this.get('guest');
  if(guest.stage||guest.endless||guest.quiz){
   this.cache.set(next,mergeProgress(this.get(next),guest));const durable=this.persist(next);
   // Move, rather than copy: a later account must never import the previous one's guest data.
   this.cache.set('guest',EMPTY());
   if(durable)this.clearGuestStorage();else this.importing.add(next);
  }
  this.status='pending';this.notify('identity');if(remote)await this.sync(remote);
 }
 clearGuestStorage(){try{for(const key of ['relica.story.guest.v2','relica.story.records.v1','relica.story.quiz.v1'])this.storage?.removeItem(key);}catch{this.localAvailable=false;}}
 async sync(remote){
  if(this.owner==='guest'||!remote)return;
  const epoch=this.epoch,owner=this.owner;
  if(this.pending.has(epoch))return this.pending.get(epoch);
  const task=(async()=>{
   this.status='syncing';this.notify();
   try{
    let revision;
    do{
     revision=this.revision;
     const result=await remote(this.get(owner));
     if(this.epoch!==epoch)return;
     this.cache.set(owner,mergeProgress(this.get(owner),result));this.persist(owner);
    }while(revision!==this.revision);
    if(this.epoch===epoch){if(this.importing.has(owner)){this.clearGuestStorage();this.importing.delete(owner);}this.status='synced';this.notify('remote');}
   }catch{if(this.epoch===epoch){this.status='error';this.notify();}}
  })();this.pending.set(epoch,task);
  try{await task;}finally{this.pending.delete(epoch);}
 }
}
const api={normalize,mergeProgress,validConfig,ProgressStore};
if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
let storage;try{storage=root.localStorage;}catch{}
let user=null,recovery=false,client=null,timer=null;
let recoveryRedirect=new URL(location.href).searchParams.get('relica_auth')==='recovery';
const config=root.RELICA_CONFIG||{},configured=validConfig(config);
const store=new ProgressStore({storage,onChange:kind=>{
 document.dispatchEvent(new CustomEvent('relica:account',{detail:{kind}}));
 if(kind==='local'&&user&&client){clearTimeout(timer);timer=setTimeout(()=>sync(),100);}
}});
async function remote(data){
 const {data:rows,error}=await client.rpc('relica_merge_progress',{p_stage:data.stage,p_endless:data.endless,p_quiz:data.quiz,p_quiz_updated_at:data.quizUpdatedAt});
 if(error||!Array.isArray(rows)||rows.length!==1)throw Error('sync');
 const row=rows[0];return normalize({stage:row.best_stage,endless:row.best_endless,quiz:row.quiz,quizUpdatedAt:row.quiz_updated_at});
}
async function sync(){if(client&&user)await store.sync(remote);}
function snapshot(){return {user:user?{id:user.id,email:user.email||''}:null,owner:store.owner,data:store.get(),configured,status:store.status,localAvailable:store.localAvailable,recovery};}
function ensure(){if(!client)throw Error('not_configured');}
function credentials(email,password){if(typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||typeof password!=='string'||password.length<8||password.length>128)throw Error('invalid_input');return {email:email.trim(),password};}
function publicError(error){if(error?.message==='not_configured')return '아직 계정 서비스가 연결되지 않았습니다. 입력하신 정보는 전송하거나 저장하지 않습니다.';if(error?.message==='invalid_input')return '이메일 형식과 비밀번호 길이(8~128자)를 확인해 주세요.';if(error?.status===429||error?.code==='over_request_rate_limit'||error?.code==='over_email_send_rate_limit')return '요청이 많습니다. 잠시 후 다시 시도해 주세요.';return '요청을 처리하지 못했습니다. 입력 정보나 이메일 인증 여부를 확인하고 다시 시도해 주세요.';}
root.RelicaAccount={snapshot,store,sync,publicError,
 saveQuiz:answers=>store.setQuiz(answers),saveRecords:(records,owner)=>store.setRecords(records,owner),
 async signIn(email,password){ensure();const {error}=await client.auth.signInWithPassword(credentials(email,password));if(error)throw error;},
 async signUp(email,password){ensure();const {data,error}=await client.auth.signUp({...credentials(email,password),options:{emailRedirectTo:location.origin+'/'}});if(error)throw error;return !!data.session;},
 async signOut(){ensure();const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;},
 async reset(email){ensure();if(typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email))throw Error('invalid_input');const {error}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo:location.origin+'/?relica_auth=recovery'});if(error)throw error;},
 async updatePassword(password){ensure();if(typeof password!=='string'||password.length<8||password.length>128)throw Error('invalid_input');const {error}=await client.auth.updateUser({password});if(error)throw error;recovery=false;store.notify('identity');},
 async google(){ensure();if(!config.google)throw Error('not_configured');const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+'/'}});if(error)throw error;}
};
if(configured&&root.supabase){
 try{
  client=root.supabase.createClient(config.url,config.key,{global:{fetch:(url,options)=>fetch(url,{...options,signal:options?.signal||AbortSignal.timeout(15000)})},auth:{flowType:'pkce',persistSession:!!storage,autoRefreshToken:true,detectSessionInUrl:true}});
  // A synchronous listener avoids acquiring the Supabase auth lock inside its callback.
  client.auth.onAuthStateChange((event,session)=>{setTimeout(()=>{
   user=session?.user||null;
   if(session&&(event==='PASSWORD_RECOVERY'||recoveryRedirect)){recovery=true;recoveryRedirect=false;const url=new URL(location.href);url.searchParams.delete('relica_auth');history.replaceState(null,'',url.pathname+url.search+url.hash);}
   if(!user)recovery=false;
   store.activate(user,remote);
  },0);});
 }catch{client=null;}
}
window.addEventListener('online',()=>sync());
})(typeof globalThis!=='undefined'?globalThis:this);
