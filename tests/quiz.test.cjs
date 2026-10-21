const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=require('../model.js');
test('선택한 성향으로 네 멤버 각각을 추천한다',()=>{
 assert.equal(typeof api.scoreQuiz,'function');
 for(const id of ['aren','elia','selene','noir']){
  const answers=api.quizQuestions.map(q=>q.options.findIndex(o=>o.member===id));
  const result=api.scoreQuiz(answers);
  assert.equal(result.memberId,id);
  assert.equal(result.scores[id],8);
  assert.equal(result.tied,false);
 }
});
test('동점은 가장 최근 선택한 공동 1위 멤버로 결정한다',()=>{
 assert.equal(typeof api.scoreQuiz,'function');
 const answers=['aren','elia','aren','elia','aren','elia','aren','elia'].map((id,i)=>api.quizQuestions[i].options.findIndex(o=>o.member===id));
 assert.equal(api.scoreQuiz(answers).memberId,'elia');
 assert.equal(api.scoreQuiz(answers).tied,true);
});
test('미완료 및 변조된 응답은 결과로 복원하지 않는다',()=>{
 assert.equal(typeof api.restoreQuiz,'function');
 for(const value of [null,'broken','{}',JSON.stringify({version:1,answers:[0]}),JSON.stringify({version:1,answers:Array(8).fill(9)})])assert.equal(api.restoreQuiz(value),null);
 const answers=Array(8).fill(0);
 const restored=api.restoreQuiz(JSON.stringify({version:1,answers,memberId:'fake'}));
 assert.deepEqual(restored.answers,answers);
 assert.equal(restored.result.memberId,api.scoreQuiz(answers).memberId);
 assert.equal(api.scoreQuiz(Array(8).fill('0')),null);
 assert.equal(api.scoreQuiz(Array(9).fill(0)),null);
});
