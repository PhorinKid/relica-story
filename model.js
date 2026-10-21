(function(root){
 const members=[
 {id:'aren',name:'아렌',en:'AREN',className:'전사',classEn:'WARRIOR',role:'리더 / 리드보컬',symbol:'sword',color:'#B86C73',palette:['#8A3741','#262126','#AAA3A6','#B86C73','#EEE8E6'],description:'털털하지만 묵직하고 책임감이 강합니다. 가장 먼저 앞에 서서 파티를 지키며, 안정감과 따뜻함을 함께 지닌 리더입니다.',line:'앞에서 길을 열고, 뒤에서는 모두를 지키는 사람.'},
 {id:'elia',name:'엘리아',en:'ELIA',className:'궁수',classEn:'ARCHER',role:'메인보컬',symbol:'bow',color:'#AFC8BC',palette:['#EEE8E2','#607466','#B8A173','#B7A28F','#AFC8BC'],description:'자유롭고 호기심이 많으며, 순간의 감각을 따라 움직입니다. 새로운 길과 작은 즐거움을 가장 먼저 발견하는 맑고 투명한 목소리의 멤버입니다.',line:'가장 먼저 새로운 길을 발견하는 사람.'},
 {id:'selene',name:'셀렌',en:'SELENE',className:'마법사',classEn:'MAGE',role:'메인보컬 / 고음',symbol:'star',color:'#9189BA',palette:['#4E4B78','#302B49','#9189BA','#A7B7DD','#C8C5D8'],description:'지적이고 신비로운 분위기 속에 다정한 마음을 품고 있습니다. 몽환적이고 섬세한 고음과 우아한 움직임으로 자신만의 이야기를 전합니다.',line:'겉은 차갑지만, 누구보다 조용히 마음을 챙기는 사람.'},
 {id:'noir',name:'누아르',en:'NOIR',className:'암살자',classEn:'ASSASSIN',role:'서브보컬 / 저음 멜로딕 랩',symbol:'moon',color:'#8883A8',palette:['#1C1A22','#313659','#4C71D9','#4B415F','#8883A8'],description:'조용하고 관찰력이 뛰어나며, 필요한 순간에 정확히 움직입니다. 낮은 목소리와 절제된 멜로딕 랩, 짧고 빠른 동작이 특징입니다.',line:'말없이 움직이지만, 가장 필요한 순간에 나타나는 사람.'}
 ];
 const memberStories={
  "aren": {
    "origin": "고원 성채",
    "originEn": "HIGHLAND FORTRESS",
    "element": "불 / 대지",
    "emblem": "검 + 방패",
    "traits": [
      "책임감",
      "안정감",
      "따뜻함"
    ],
    "vocal": "따뜻하고 안정적인 중저음으로 곡의 중심을 잡습니다.",
    "performance": "직선적인 움직임과 낮고 안정된 무게중심, 강한 정지 동작으로 전사의 힘을 전합니다.",
    "departure": "붉은 고원 암석 위, 성벽과 감시탑 사이로 강한 바람이 부는 곳. 아렌의 이야기는 고원 성채에서 출발합니다.",
    "personality": "털털하지만 묵직하고, 맡은 일에는 끝까지 책임을 다합니다. 위험 앞에서는 가장 먼저 앞에 서지만, 동료를 대하는 마음에는 안정감과 따뜻함이 함께 있습니다.",
    "related": "noir",
    "relationship": "아렌이 정면에서 길을 열면, 누아르는 보이지 않는 곳에서 필요한 순간을 살핍니다."
  },
  "elia": {
    "origin": "고대 숲",
    "originEn": "ANCIENT FOREST",
    "element": "바람 / 빛",
    "emblem": "화살 + 깃털",
    "traits": [
      "호기심",
      "자유로움",
      "발견"
    ],
    "vocal": "맑고 시원하며 투명한 목소리의 메인보컬입니다.",
    "performance": "곡선과 회전, 바람처럼 이어지는 팔의 궤적으로 가볍고 유연한 리듬을 만듭니다.",
    "departure": "햇빛과 바람이 거목 사이를 지나는 고대 숲. 엘리아는 익숙한 풍경 속에서도 새로운 길과 작은 즐거움을 발견합니다.",
    "personality": "청순하고 순수한 분위기 속에 자유로운 호기심을 품고 있습니다. 계획보다 순간의 감각을 따라 움직이며, 다른 멤버가 지나칠 수 있는 가능성을 먼저 알아봅니다.",
    "related": "selene",
    "relationship": "직감과 행동으로 새로운 가능성을 여는 엘리아. 지식과 분석으로 길을 살피는 셀렌과 서로를 보완합니다."
  },
  "selene": {
    "origin": "호숫가 초원",
    "originEn": "LAKESIDE MEADOW",
    "element": "물 / 얼음",
    "emblem": "별 + 결정",
    "traits": [
      "탐구심",
      "섬세함",
      "조용한 배려"
    ],
    "vocal": "몽환적이고 섬세한 고음, 감성적인 메인보컬로 이야기에 깊이를 더합니다.",
    "performance": "손끝과 시선, 길고 우아한 움직임으로 섬세한 감정을 표현합니다.",
    "departure": "잔잔한 호수와 넓은 초원, 오래된 석조 유적이 남은 곳. 셀렌의 출발점에는 고요한 물빛이 흐릅니다.",
    "personality": "지적이고 신비로운 분위기 때문에 차갑게 보이지만, 마음은 다정합니다. 지식이 풍부한 한편 일상에서는 엉뚱하거나 서툴기도 합니다. 배려는 말보다 조용한 행동으로 보여줍니다.",
    "related": "elia",
    "relationship": "깊이 생각하고 분석하는 셀렌과, 감각을 따라 먼저 움직이는 엘리아. 서로 다른 방식이 만나 더 넓은 길을 찾습니다."
  },
  "noir": {
    "origin": "달빛 주거지",
    "originEn": "MOONLIT RESIDENTIAL DISTRICT",
    "element": "어둠 / 번개",
    "emblem": "초승달 + 단검",
    "traits": [
      "관찰력",
      "침착함",
      "은근한 장난기"
    ],
    "vocal": "낮은 음역과 말하듯 부르는 짧고 절제된 멜로딕 랩을 담당합니다.",
    "performance": "짧은 동작과 갑작스러운 정지, 빠른 방향 전환으로 자신만의 리듬을 드러냅니다.",
    "departure": "달빛이 낮은 지붕을 비추는 중세 주거지. 목조·석조 주택 사이의 돌 골목에서 누아르의 이야기가 시작됩니다.",
    "personality": "조용히 관찰하며 다른 멤버가 놓친 작은 변화를 먼저 알아봅니다. 무심해 보여도 필요한 순간에는 정확히 개입합니다. 가끔 아무렇지 않게 장난을 치거나, 뜻밖의 허당기를 보이기도 합니다.",
    "related": "aren",
    "relationship": "눈에 보이지 않는 곳을 살피는 누아르와, 정면에서 파티를 지키는 아렌. 서로 다른 위치에서 동료를 지킵니다."
  }
};
 for(const member of members){Object.assign(member,memberStories[member.id],{portrait:"assets/story/"+member.id+"-portrait-v1.png"});}
 function transition(state,action){
  if(action.type==='enter')return {entered:true,page:'home'};
  if(action.type==='navigate'&&state.entered&&['home','relica','test','game'].includes(action.page))return {...state,page:action.page};
  return state;
 }

 // 성격 설정을 바탕으로 만든 체험용 문항 초안입니다. 게임 밸런스와는 독립적입니다.
 const quizQuestions=[
  ['낯선 길에서 파티가 멈췄습니다. 가장 먼저 하실 일은?',[
   ['aren','제가 앞에 서서 안전한 길을 열어볼게요.'],['elia','주변에 더 재미있는 길이 있는지 찾아볼게요.'],['selene','알고 있는 정보를 모아 길을 생각해 볼게요.'],['noir','흔적과 주변 움직임부터 조용히 살펴볼게요.']]],
  ['새로운 장소에 도착하면 무엇에 눈길이 가시나요?',[
   ['elia','우연히 발견한 골목과 처음 보는 풍경'],['noir','사람들이 놓치고 지나가는 작은 변화'],['aren','함께 온 사람들이 편하게 쉴 수 있는 곳'],['selene','이 장소에 얽힌 이야기와 지식']]],
  ['친구가 조금 지쳐 보입니다. 어떻게 마음을 전하시나요?',[
   ['selene','필요할 만한 것을 준비해 조용히 건네요.'],['aren','곁에 서서 기대어도 괜찮다고 말해줘요.'],['noir','상황을 살피다가 필요한 순간에 도와줘요.'],['elia','기분이 바뀔 만한 작은 즐거움을 찾아요.']]],
  ['처음 해보는 일을 맡았습니다. 어떤 방식이 편하신가요?',[
   ['noir','충분히 관찰하고 정확한 타이밍에 움직여요.'],['selene','원리를 이해하고 차근차근 풀어가요.'],['elia','직접 부딪치며 감각을 익혀가요.'],['aren','우선 맡은 역할을 끝까지 책임져요.']]],
  ['모두의 의견이 갈릴 때, 본인과 가까운 모습은?',[
   ['aren','이야기를 듣고 함께 갈 방향을 잡아요.'],['selene','선택지의 근거를 정리해 전달해요.'],['elia','아직 생각 못 한 새로운 가능성을 꺼내요.'],['noir','말 사이의 분위기를 읽고 핵심을 짚어요.']]],
  ['예상치 못하게 여유 시간이 생겼습니다.',[
   ['elia','마음이 끌리는 곳으로 가볍게 떠나요.'],['aren','함께할 사람들을 챙기며 시간을 보내요.'],['noir','조용한 곳에서 주변을 바라보며 쉬어요.'],['selene','궁금했던 이야기나 지식을 찾아봐요.']]],
  ['파티에서 가장 보람을 느낄 순간은?',[
   ['noir','필요한 순간에 정확한 한 수를 보탰을 때'],['elia','새로운 길을 발견해 모두와 나눴을 때'],['selene','고민해 둔 방법이 누군가에게 도움이 될 때'],['aren','모두가 제 곁에서 안심하고 나아갈 때']]],
  ['이번 여정에 하나의 마음을 담는다면?',[
   ['selene','깊이 이해하고, 조용히 마음을 전하기'],['noir','세심하게 살피고, 순간을 놓치지 않기'],['aren','든든하게 버티고, 함께하는 이들을 지키기'],['elia','자유롭게 만나고, 새로운 즐거움을 찾기']]]
 ].map(([title,options])=>({title,options:options.map(([member,text])=>({member,text}))}));
 const quizProfiles={
  aren:{title:'함께할 때 더 단단해지는 사람',traits:['책임감','든든함','따뜻한 리더십'],reason:'함께하는 사람을 챙기고 맡은 역할을 지키는 선택이 많으셨습니다. 안정감과 따뜻함으로 파티의 앞에 서는 아렌과 닮은 면이 있습니다.',play:'검기로 여러 적을 관통하며 방어선을 지켜보세요.'},
  elia:{title:'새로운 길에서 즐거움을 찾는 사람',traits:['호기심','자유로움','발견'],reason:'새로운 가능성을 찾고 순간의 감각을 따르는 선택이 많으셨습니다. 작은 즐거움과 낯선 길을 먼저 발견하는 엘리아와 닮은 면이 있습니다.',play:'활로 적을 겨냥하고 나만의 화살 강화를 골라보세요.'},
  selene:{title:'깊은 생각에 다정함을 담는 사람',traits:['탐구심','섬세함','조용한 배려'],reason:'상황을 이해하고 조용히 도움을 준비하는 선택이 많으셨습니다. 지적인 분위기 속에 다정한 마음을 품은 셀렌과 닮은 면이 있습니다.',play:'마법에 전기·얼음·불 효과를 더해 방어해 보세요.'},
  noir:{title:'작은 순간도 놓치지 않는 사람',traits:['관찰력','침착함','정확한 행동'],reason:'주변을 세심하게 살피고 필요한 순간을 기다리는 선택이 많으셨습니다. 조용히 관찰하다 정확하게 움직이는 누아르와 닮은 면이 있습니다.',play:'빠른 단검과 벽 반사로 다가오는 적을 막아보세요.'}
 };
 function scoreQuiz(answers){
  if(!Array.isArray(answers)||answers.length!==quizQuestions.length)return null;
  const scores=Object.fromEntries(members.map(m=>[m.id,0]));
  for(let i=0;i<answers.length;i++){
   if(!Number.isInteger(answers[i])||!quizQuestions[i].options[answers[i]])return null;
   scores[quizQuestions[i].options[answers[i]].member]++;
  }
  const best=Math.max(...Object.values(scores));
  const leaders=members.filter(m=>scores[m.id]===best).map(m=>m.id);
  const memberId=[...answers].reverse().map((answer,i)=>quizQuestions[answers.length-1-i].options[answer].member).find(id=>leaders.includes(id));
  return {memberId,scores,tied:leaders.length>1};
 }
 function restoreQuiz(raw){
  try{const saved=JSON.parse(raw);if(!saved||saved.version!==1)return null;const result=scoreQuiz(saved.answers);return result?{answers:saved.answers,result}:null;}catch{return null;}
 }
 const api={quizQuestions,quizProfiles,scoreQuiz,restoreQuiz,members,getMember:id=>members.find(m=>m.id===id)||null,transition};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.Relica=api;
})(typeof globalThis!=='undefined'?globalThis:this);
