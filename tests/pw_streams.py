"""R04 streams and skillbar: two browsers × new/legacy × three professions."""
import json,os
from playwright.sync_api import sync_playwright
import pw_baseline as base
OUT='/workspace/design/laoyang_m1_shots/codex_streams'
def main():
 os.makedirs(OUT,exist_ok=True);srv,url=base.start_server();report=[]
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch()
   for kind in ['new','legacy']:
    for cls in ['zs','fs','ds']:
     ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,service_workers='block')
     cloud=base.Cloud('ok');ctx.route('https://*.supabase.co/**',cloud.handle)
     ctx.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(base.fake_session()))+')')
     p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
     p.on('console',lambda m:errors.append(m.text) if m.type=='error' and not any(x in m.text for x in ['404','Service Worker registration blocked']) else None)
     p.goto(url+'/index.html');p.wait_for_function("typeof CL!=='undefined'&&CL.ready",timeout=20000);p.wait_for_timeout(1200)
     p.evaluate("c=>{CQSys.createChar('技能'+c,c);closeM();save()}",cls)
     p.wait_for_function("!document.body.classList.contains('nochar')",timeout=15000)
     if kind=='legacy':
      p.evaluate("()=>{delete S.battleSkills;delete S.battleSkillsCls;const raw=JSON.stringify(S);GS.setItem(KEY,raw);GS.setItem(CH_PRE+ACCT.cur,raw)}")
      # Exercise real loader against a pre-feature character, then persist migrated result.
      p.evaluate('load();save()')
     assert p.evaluate('CQSys.battleSkills().filter(Boolean).length===4')
     for build in range(3):
      p.evaluate('i=>CQSys.streamChoose(i)',build)
      p.evaluate("TAB='skill';render()")
      assert p.locator('.mir2-streams button').count()==3
      p.screenshot(path=f'{OUT}/{engine}_{kind}_{cls}_stream{build}.png')
     p.evaluate("TAB='fight';render()")
     # Freeze game ticks while inspecting deterministic UI states; scene keeps rendering.
     p.evaluate("()=>{window.step=()=>{};S.lvl=60;S.autoSk=0;for(const s of CLS_SKILLS)if(s.cls===S.cls)S.sk[s.id]=1;calc();H.life=ST.life;H.mana=ST.mana;H.castT=0;for(const id in ACT)delete ACT[id];TAB='fight';render()}")
     p.wait_for_timeout(700)
     tag=f'{engine}_{kind}_{cls}'
     def shot(state):
      p.wait_for_timeout(250);p.screenshot(path=f'{OUT}/{tag}_{state}.png')
      assert p.evaluate('document.documentElement.scrollWidth<=390')
     shot('normal')
     assert p.locator('.cqb button.csk').count()==4
     assert p.locator('.cqb button.csk').evaluate_all('(es)=>es.every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44})')
     # A durable skill cooldown, same ACT clock used by auto.
     skill=p.evaluate("CLS_SKILLS.find(s=>s.cls===S.cls&&s.cd&&s.ty!=='passive').id")
     p.evaluate("id=>{CQSys.setBattleSkill(0,id);H.castT=0;H.mana=ST.mana;MON=[mkMon(Object.keys(MONS)[0],60)];MON[0].hp=MON[0].max=1e9}",skill)
     p.wait_for_timeout(250);before=p.evaluate('H.mana');cost=p.evaluate('id=>SV(id,slvl(id)).mana',skill)
     p.locator('.cqb .csk[data-sk="0"]').click()
     assert p.evaluate('id=>clsCdLeft(id)>0',skill)
     assert p.evaluate('id=>!CQSys.manualSkill(id).ok',skill)
     assert p.evaluate('id=>!acFeasible(id,liveMon())',skill)
     # Melee can return mana on hit; pure deduction covered by unit test buff.
     assert p.evaluate('H.mana')<=before-cost+2
     shot('cooldown')
     assert p.locator('.cqb .csk[data-sk="0"] .cdt').inner_text()
     p.evaluate('H.mana=0;H.castT=0;for(const id in ACT)delete ACT[id]')
     shot('nomana');assert p.locator('.cqb .csk.nomana').count()>0
     p.evaluate('CQSys.setBattleSkill(0,null)');shot('empty')
     p.locator('.cqb .csk[data-sk="0"]').click();p.wait_for_timeout(300)
     assert p.locator('.cqbarslots').count()==1
     shot('config');assert p.locator('.cqbarslots button').evaluate_all('(es)=>es.every(e=>e.getBoundingClientRect().height>=44&&e.scrollWidth<=e.clientWidth+2&&e.scrollHeight<=e.clientHeight+2)')
     p.locator('.cqbarslots button').first.click();shot('picker');assert p.locator('.cqbarchoices button').evaluate_all('(es)=>es.every(e=>e.getBoundingClientRect().height>=44&&e.scrollWidth<=e.clientWidth+2&&e.scrollHeight<=e.clientHeight+2)')
     bd=p.evaluate(base.JS_BACKDROP);assert isinstance(bd,list);p.mouse.click(*bd)
     assert p.locator('#modal').evaluate("e=>e.classList.contains('hide')")
     p.locator('.cqbarslots button').first.click();p.locator('.cqbarchoices button').first.click()
     configured=p.evaluate('JSON.stringify(CQSys.battleSkills())')
     p.evaluate('async()=>{save();await flushNow()}');p.reload();p.wait_for_function("typeof CL!=='undefined'&&CL.ready",timeout=20000);p.wait_for_timeout(600)
     assert p.evaluate('JSON.stringify(CQSys.battleSkills())')==configured
     errors=[e for e in errors if not ('supabase.co' in e and 'access control' in e)]
     assert not errors,errors
     report.append({'browser':engine,'save':kind,'class':cls,'passed':True});print(tag,'PASS',flush=True);ctx.close()
   browser.close()
 srv.shutdown()
 with open(OUT+'/report.json','w') as f:json.dump(report,f,ensure_ascii=False,indent=2)
 print('12 combinations passed; 108 screenshots')
if __name__=='__main__':main()
