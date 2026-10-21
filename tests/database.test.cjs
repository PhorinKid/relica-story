const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {PGlite}=require('@electric-sql/pglite');
test('실제 PostgreSQL에서 두 계정의 RLS·원자적 병합·비로그인 차단을 검증한다',async()=>{
 const db=new PGlite();try{
 await db.exec("create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,public to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');");
 const schema=fs.readFileSync(__dirname+'/../supabase/schema.sql','utf8');await db.exec(schema);await db.exec(schema);
 const login=async(id)=>{await db.exec('reset role;set role authenticated;');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
 const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
 await login(a);const quiz={version:1,answers:Array(8).fill(1)};
 await db.query('select * from public.relica_merge_progress($1,$2,$3,$4)',[5,1000,quiz,200]);
 const merge=await db.query('select * from public.relica_merge_progress($1,$2,$3,$4)',[2,1500,{version:1,answers:Array(8).fill(2)},100]);assert.equal(Number(merge.rows[0].best_stage),5);assert.equal(Number(merge.rows[0].best_endless),1500);assert.equal(merge.rows[0].quiz.answers[0],1);
 await assert.rejects(db.query('insert into public.relica_progress(user_id) values($1)',[b]),/row-level security/);
 await assert.rejects(db.query('select * from public.relica_merge_progress($1,$2,$3,$4)',[9,0,{version:1,answers:[99]},100]),/check constraint/);
 await login(b);assert.equal((await db.query('select * from public.relica_progress')).rows.length,0);
 await db.query('select * from public.relica_merge_progress(1,100,null,0)');
 assert.equal((await db.query('update public.relica_progress set best_stage=999 where user_id=$1 returning *',[a])).rows.length,0);
 await assert.rejects(db.query('update public.relica_progress set user_id=$1 where user_id=$2',[a,b]),/row-level security/);
 await login(a);assert.equal(Number((await db.query('select * from public.relica_progress')).rows[0].best_stage),5);
 await db.exec("reset role;set role anon;select set_config('request.jwt.claim.sub','',false);");
 await assert.rejects(db.query('select * from public.relica_progress'),/permission denied/);
 await assert.rejects(db.query('select * from public.relica_merge_progress(999,999,null,0)'),/permission denied/);
 }finally{await db.close();}
});
