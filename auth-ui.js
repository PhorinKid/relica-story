(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let authMode='login',busy=false,request=0;
const auth=RelicaAccount;
function setAuth(mode){
 authMode=mode;const signup=mode==='signup';
 $$('[data-auth]').forEach(tab=>{const active=tab.dataset.auth===mode;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
 $('#auth-panel').setAttribute('aria-labelledby',signup?'signup-tab':'login-tab');$('#confirm-field').hidden=!signup;$('#confirm-password').required=signup;
 $('#password').autocomplete=signup?'new-password':'current-password';$('#auth-submit').textContent=signup?'회원가입':'로그인';
 $('#auth-status').textContent=auth.snapshot().configured?'이메일로 가입하고 인증한 뒤 로그인해 주세요.':'화면 미리보기입니다. 계정 서비스 연결 후 이용할 수 있습니다.';
 $('#confirm-password').setCustomValidity('');
}
function render(){
 const account=auth.snapshot();
 $('#auth-title').textContent=account.recovery?'새 비밀번호를 설정하세요.':account.user?'당신의 여정을 보관합니다.':'이야기를 이어가세요.';
 $('#auth-dialog>.modal-copy').textContent=account.user?'테스트 결과와 최고 기록을 관리하세요.':'로그인하고 당신의 여정을 함께 보관하세요.';$('#auth-guest-note').hidden=!!account.user;
 $('#login span').textContent=account.user?'내 계정':'로그인';$('#auth-guest').hidden=!!account.user||account.recovery;
 $('#account-panel').hidden=!account.user||account.recovery;$('#recovery-panel').hidden=!account.recovery;
 $('#account-email').textContent=account.user?.email||'';
 $('#account-sync-status').textContent=account.status==='synced'?'테스트 결과와 최고 기록을 서버에 저장했습니다.':account.status==='error'?(account.localAvailable?'서버 저장에 실패했습니다. 기록은 현재 브라우저에 보관되어 있습니다. 다시 동기화해 주세요.':'서버와 브라우저 저장에 실패했습니다. 창을 닫기 전에 다시 동기화해 주세요.'):'계정 기록을 서버와 동기화하는 중입니다.';
 $('#account-sync').disabled=busy||account.status==='syncing';
 $('#google-login').hidden=!(window.RELICA_CONFIG?.google&&account.configured);$('#google-divider').hidden=$('#google-login').hidden;
 if(account.recovery&&!$('#auth-dialog').open)$('#auth-dialog').showModal();
}
function setBusy(value){busy=value;for(const el of $$('#auth-dialog button:not([data-close]),#auth-dialog input'))el.disabled=value;render();}
async function submit(task,success){
 if(busy)return;const id=++request;setBusy(true);$('#auth-status').textContent='요청을 처리하는 중입니다.';
 try{const result=await task();if(id===request)$('#auth-status').textContent=typeof success==='function'?success(result):success;}
 catch(error){if(id===request)$('#auth-status').textContent=auth.publicError(error);}
 finally{setBusy(false);$('#password').value='';$('#confirm-password').value='';$('#new-password').value='';$('#new-password-confirm').value='';}
}
$('#login').addEventListener('click',()=>{render();$('#auth-dialog').showModal();});
$$('[data-auth]').forEach(tab=>{
 tab.addEventListener('click',()=>{if(!busy)setAuth(tab.dataset.auth);});
 tab.addEventListener('keydown',event=>{if(!busy&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const mode=event.key==='Home'?'login':event.key==='End'?'signup':authMode==='login'?'signup':'login';setAuth(mode);$('[data-auth="'+mode+'"]').focus();}});
});
$('#auth-panel').addEventListener('submit',event=>{
 event.preventDefault();if(busy)return;
 if(authMode==='signup'&&$('#password').value!==$('#confirm-password').value){$('#confirm-password').setCustomValidity('비밀번호가 일치하지 않습니다.');$('#confirm-password').reportValidity();return;}
 const email=$('#email').value,password=$('#password').value,signup=authMode==='signup';
 submit(()=>signup?auth.signUp(email,password):auth.signIn(email,password),session=>signup&&!session?'가입이 가능한 이메일이면 확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.':'로그인했습니다.');
});
$('#confirm-password').addEventListener('input',()=>$('#confirm-password').setCustomValidity(''));$('#password').addEventListener('input',()=>$('#confirm-password').setCustomValidity(''));
$('#password-reset').addEventListener('click',()=>{
 const email=$('#email');if(!email.reportValidity())return;
 submit(()=>auth.reset(email.value),'가입된 이메일이면 비밀번호 재설정 안내를 보냈습니다. 메일함을 확인해 주세요.');
});
$('#google-login').addEventListener('click',()=>submit(()=>auth.google(),'Google 로그인으로 이동합니다.'));
$('#account-sync').addEventListener('click',()=>submit(()=>auth.sync(),'동기화 요청을 마쳤습니다. 위의 저장 상태를 확인해 주세요.'));
$('#account-logout').addEventListener('click',()=>submit(()=>auth.signOut(),'로그아웃했습니다. 이제 게스트로 이용하실 수 있습니다.'));
$('#new-password-confirm').addEventListener('input',()=>$('#new-password-confirm').setCustomValidity(''));$('#new-password').addEventListener('input',()=>$('#new-password-confirm').setCustomValidity(''));
$('#recovery-panel').addEventListener('submit',event=>{event.preventDefault();if($('#new-password').value!==$('#new-password-confirm').value){$('#new-password-confirm').setCustomValidity('비밀번호가 일치하지 않습니다.');$('#new-password-confirm').reportValidity();return;}const password=$('#new-password').value;submit(()=>auth.updatePassword(password),'비밀번호를 변경했습니다.');});
$('#auth-dialog').addEventListener('close',()=>{request++;$('#auth-panel').reset();$('#recovery-panel').reset();setAuth('login');});
document.addEventListener('relica:account',render);setAuth('login');render();
})();
