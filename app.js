'use strict';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let state={entered:false,page:'home'};
const icons={
 sword:'<path d="M16 3v23m-5-16 5-7 5 7M9 21h14M13 28h6M9 8l-5 7 5 7"/>',
 bow:'<path d="M10 3c19 8 19 18 0 26l6-13-6-13Zm6 13h14m-5-4 5 4-5 4M6 7l-3 4 4 2"/>',
 star:'<path d="m16 2 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z"/><path d="m16 9 3 7-3 7-3-7 3-7Z"/>',
 moon:'<path d="M25 23A13 13 0 0 1 10 3a13 13 0 1 0 15 20ZM22 5l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4Z"/>'
};
function icon(m){return `<svg class="class-icon" viewBox="0 0 32 32" aria-hidden="true">${icons[m.symbol]}</svg>`;}
function card(m,i){return `<button class="member-card" data-member="${m.id}" style="--member:${m.color}" aria-label="${m.name} ${m.className} 소개"><img class="member-portrait" src="${m.portrait}" alt="${m.origin}의 ${m.name}" width="1024" height="1536" loading="eager"><span class="member-card-shade"></span><span class="card-top">${icon(m)}<span class="member-index">0${i+1} / RELICA</span></span><span class="member-card-copy"><span class="member-en">${m.en}</span><span class="member-bottom"><span>${m.name} · ${m.className}</span><span class="arrow" aria-hidden="true">↗</span></span><span class="member-card-origin">${m.origin}</span></span></button>`;}
$('#home-members').innerHTML=Relica.members.map(card).join('');
$('#all-members').innerHTML=Relica.members.map(card).join('');
$('#character-select').innerHTML=Relica.members.map((m,i)=>`<button data-character="${m.id}" aria-pressed="${i===0}" style="--member:${m.color}"><img src="${RelicaPresentation.memberAssets[m.id]}" loading="lazy" decoding="async" alt="" width="60" height="68"><span>${m.name} · ${m.className}</span></button>`).join('');
function render(focus=true){
 $('#entrance').hidden=state.entered;
 $('#site').hidden=!state.entered;
 document.body.classList.toggle('inside',state.entered);
 window.RelicaDefense?.show(state.entered&&state.page==='game');
 $$('[data-view]').forEach(el=>el.hidden=el.dataset.view!==state.page);
 $$('.site-header nav [data-page]').forEach(button=>{
  if(button.dataset.page===state.page)button.setAttribute('aria-current','page');
  else button.removeAttribute('aria-current');
 });
 document.title=state.entered?`${{home:'홈',relica:'RELICA 소개',test:'클래스 테스트',game:'미니 게임'}[state.page]} · RELICA STORY`:'RELICA STORY — Four Classes. One Story.';
 window.scrollTo({top:0,behavior:'instant'});
 if(focus){const target=state.entered?$('#main'):$('#enter');target.focus({preventScroll:true});}
}
$('#enter').addEventListener('click',()=>{state=Relica.transition(state,{type:'enter'});render();});
$('#back-entrance').addEventListener('click',()=>{state={entered:false,page:'home'};render();});
document.addEventListener('click',event=>{
 const page=event.target.closest('[data-page]');
 if(page){state=Relica.transition(state,{type:'navigate',page:page.dataset.page});render();}
 const member=event.target.closest('[data-member]');
 if(member){const m=Relica.getMember(member.dataset.member);if(!m)return;
  $('#member-dialog').style.setProperty('--member',m.color);
  const partner=Relica.getMember(m.related);
  $('#member-detail').innerHTML=`<div class="member-detail-layout"><figure class="member-detail-art"><img src="${m.portrait}" alt="${m.origin}에서 출발하는 ${m.name}의 소개 일러스트" width="1024" height="1536"><figcaption>${m.originEn}</figcaption></figure><div class="member-story"><p class="eyebrow">RELICA / ${m.classEn}</p><h2 id="member-title">${m.en}<span>${m.name}</span></h2><p class="member-meta">${m.className} · ${m.role}</p><div class="profile-traits">${m.traits.map(t=>'<span>'+t+'</span>').join('')}</div><p class="member-description">${m.personality}</p><dl class="profile-facts"><div><dt>속성</dt><dd>${m.element}</dd></div><div><dt>심볼</dt><dd>${m.emblem}</dd></div></dl><section><h3>목소리와 움직임</h3><p>${m.vocal}</p><p>${m.performance}</p></section><section><h3>이야기의 출발점 · ${m.origin}</h3><p>${m.departure}</p></section><section class="profile-relation"><h3>함께할 때의 모습</h3><p>${m.relationship}</p><button class="text-link" data-member="${partner.id}">${partner.name} 만나보기 ↗</button></section><div class="palette" aria-label="${m.name} 기본 다섯 색">${m.palette.map(c=>'<span style="--swatch:'+c+'" title="'+c+'"></span>').join('')}</div><button class="profile-test-link text-link" data-page="test" data-close>나와 닮은 멤버 찾기 ⟶</button></div></div>`;
  $('#member-dialog').showModal();
  $('#member-dialog').scrollTop=0;
 }
 const character=event.target.closest('[data-character]');
 if(character){window.RelicaDefense?.select(character.dataset.character);$('#quiz-game-notice').hidden=true;}
 if(event.target.closest('[data-close]'))event.target.closest('dialog').close();
});
$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
let quizOwner=RelicaAccount.snapshot().owner,quizSavedSignature=JSON.stringify(RelicaAccount.snapshot().data.quiz);
let quizAnswers=[],quizIndex=0,quizResult=null;
{const saved=Relica.restoreQuiz(JSON.stringify(RelicaAccount.snapshot().data.quiz));if(saved){quizAnswers=saved.answers;quizResult=saved.result;}}
function showQuizQuestion(){
 $('#quiz-intro').hidden=true;$('#quiz-result').hidden=true;$('#quiz-form').hidden=false;
 const question=Relica.quizQuestions[quizIndex];
 $('#quiz-position').textContent=String(quizIndex+1).padStart(2,'0')+' / '+String(Relica.quizQuestions.length).padStart(2,'0');
 $('#quiz-meter').value=quizIndex+1;$('#quiz-question').textContent=question.title;
 $('#quiz-options').innerHTML=question.options.map((option,i)=>`<label class="quiz-option"><input type="radio" name="quiz-answer" value="${i}" ${quizAnswers[quizIndex]===i?'checked':''}><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${option.text}</span><span class="option-check" aria-hidden="true">✧</span></label>`).join('');
 $('#quiz-back').disabled=quizIndex===0;$('#quiz-next').disabled=!Number.isInteger(quizAnswers[quizIndex]);
 $('#quiz-next').textContent=quizIndex===Relica.quizQuestions.length-1?'결과 만나보기 ✦':'다음 질문 ⟶';
 $('#quiz-question').focus({preventScroll:true});$('#quiz-form').scrollIntoView({block:'start',behavior:'instant'});
}
function showQuizResult(saveStatus){
 const m=Relica.getMember(quizResult.memberId),profile=Relica.quizProfiles[m.id];
 $('#quiz-intro').hidden=true;$('#quiz-form').hidden=true;$('#quiz-result').hidden=false;
 $('#quiz-result').style.setProperty('--member',m.color);
 $('#quiz-result').innerHTML=`<div class="quiz-result-heading"><p class="eyebrow">YOUR RELICA COMPANION</p><h1 tabindex="-1" id="quiz-result-title">당신과 닮은 멤버는</h1></div><article class="result-card"><div class="result-emblem">${icon(m)}<span>0${Relica.members.indexOf(m)+1} / RELICA</span></div><p class="result-en">${m.en}</p><h2>${m.name}<span>${m.className}</span></h2><p class="result-tagline">${profile.title}</p><div class="result-traits">${profile.traits.map(t=>'<'+'span>'+t+'</span>').join('')}</div><div class="result-reason"><p class="eyebrow">YOUR CHOICES TELL A STORY</p><p>${profile.reason}</p>${quizResult.tied?'<p class="quiz-footnote">여러 멤버의 성향이 함께 나타나, 동점 멤버 중 가장 최근 선택을 추천에 반영했습니다.</p>':''}</div><div class="result-palette" aria-hidden="true">${m.palette.map(c=>'<i style="background:'+c+'"></i>').join('')}</div><p class="result-edition">RELICA STORY · FIND YOUR PARTY</p></article><div class="result-next"><p>이제, ${m.name}의 전투를 만나보세요.</p><p class="section-copy">${profile.play}</p><button id="quiz-play" class="defense-primary">${m.name}와 함께 미니 게임 하기 ⟶</button><div class="result-links"><button class="text-link" data-member="${m.id}">${m.name} 자세히 보기 ↗</button><button id="quiz-retry" class="text-link">다시 테스트하기 ↻</button></div><p id="quiz-save-status" class="quiz-footnote" role="status"></p><p class="quiz-footnote">취향을 가볍게 살펴보는 테스트입니다. 다른 멤버로도 자유롭게 플레이하실 수 있습니다.</p></div>`;
 $('#quiz-save-status').textContent=saveStatus;
}
$('#quiz-start').addEventListener('click',()=>{quizAnswers=[];quizIndex=0;showQuizQuestion();});
$('#quiz-options').addEventListener('change',event=>{if(!event.target.matches('input[type="radio"]'))return;quizAnswers[quizIndex]=Number(event.target.value);$('#quiz-next').disabled=false;});
$('#quiz-back').addEventListener('click',()=>{if(quizIndex>0){quizIndex--;showQuizQuestion();}});
$('#quiz-form').addEventListener('submit',event=>{
 event.preventDefault();if(!Number.isInteger(quizAnswers[quizIndex]))return;
 if(quizIndex<Relica.quizQuestions.length-1){quizIndex++;showQuizQuestion();return;}
 quizResult=Relica.scoreQuiz(quizAnswers);if(!quizResult)return;
 let status='테스트 결과를 이 브라우저에 저장했습니다. 같은 브라우저에서 다시 확인하실 수 있습니다.';
 RelicaAccount.saveQuiz(quizAnswers);if(!RelicaAccount.snapshot().localAvailable)status='결과를 저장하지 못했습니다. 현재 화면에서는 확인하실 수 있습니다.';else if(RelicaAccount.snapshot().user)status='테스트 결과를 계정에 저장하는 중입니다.';
 showQuizResult(status);$('#quiz-result-title').focus({preventScroll:true});$('#quiz-result').scrollIntoView({block:'start',behavior:'instant'});
});
$('#quiz-result').addEventListener('click',event=>{
 if(event.target.closest('#quiz-retry')){quizAnswers=[];quizIndex=0;showQuizQuestion();}
 if(event.target.closest('#quiz-play')){
  const selected=window.RelicaDefense?.select(quizResult.memberId);
  const notice=$('#quiz-game-notice');notice.hidden=false;
  notice.textContent=selected?'테스트에서 추천된 '+Relica.getMember(quizResult.memberId).name+'를 선택했습니다. 모드를 고르고 게임 시작을 눌러주세요.':'진행 중인 전투가 있습니다. 현재 전투를 마친 뒤 추천 멤버를 선택하실 수 있습니다.';
  state=Relica.transition(state,{type:'navigate',page:'game'});render();
 }
});
if(quizResult)showQuizResult('이 브라우저에 저장된 테스트 결과입니다.');

document.addEventListener('relica:account',()=>{
 const account=RelicaAccount.snapshot(),signature=JSON.stringify(account.data.quiz),ownerChanged=quizOwner!==account.owner;
 if(ownerChanged||(signature!==quizSavedSignature&&$('#quiz-form').hidden)){
  const saved=Relica.restoreQuiz(JSON.stringify(account.data.quiz));quizResult=saved?.result||null;quizAnswers=saved?.answers||[];quizIndex=0;
  if(quizResult)showQuizResult(account.user?'계정에 보관된 테스트 결과입니다.':'이 브라우저에 저장된 테스트 결과입니다.');
  else{$('#quiz-result').hidden=true;$('#quiz-form').hidden=true;$('#quiz-intro').hidden=false;}
 }
 quizOwner=account.owner;quizSavedSignature=signature;
 const status=$('#quiz-save-status');if(status&&account.user)status.textContent=account.status==='synced'?'테스트 결과를 계정에 저장했습니다.':account.status==='error'?'서버 저장에 실패했습니다. 현재 결과를 유지하고 있으며 내 계정에서 다시 동기화할 수 있습니다.':'테스트 결과를 계정과 동기화하는 중입니다.';
});
render(false);
