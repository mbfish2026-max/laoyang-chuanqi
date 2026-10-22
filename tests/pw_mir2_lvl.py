#!/usr/bin/env python3
"""390×844 Chromium/WebKit: public character factory, legacy load, rebirth UI."""
import os,json,re
from playwright.sync_api import sync_playwright
from pw_baseline import start_server,Cloud,fake_session
OUT='/workspace/design/laoyang_m1_shots/codex_mir2_lvl'
os.makedirs(OUT,exist_ok=True)
server,base=start_server()
results=[]
with sync_playwright() as p:
 for engine in ['chromium','webkit']:
  browser=getattr(p,engine).launch()
  for legacy in [False,True]:
   context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,service_workers='block',locale='zh-CN')
   cloud=Cloud('ok');context.route(re.compile(r'https://[a-z0-9]+\.supabase\.co/.*'),cloud.handle)
   context.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(fake_session()))+');localStorage.setItem("cq_bonus_open","1")')
   page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(base+'/index.html',wait_until='load');page.wait_for_timeout(2500)
   page.evaluate("""() => {closeM();CQSys.createChar('等级验收','fs');S.auto=0;SPEED=0;TAB='hero';calc();render();} """)
   if legacy:
    page.evaluate("""() => {S.lvl=70;S.xp=cqOldXp(70);S.sv=5;delete S.cqProgress;save();load();S.auto=0;calc();TAB='hero';closeM();render();} """)
    assert page.evaluate('S.lvl===55&&S.cqLegacyLevel===70')
   tag=engine+('_legacy' if legacy else '_fresh')
   page.wait_for_timeout(2000)
   page.screenshot(path=OUT+'/'+tag+'_role.png')
   assert page.locator('.cqrole .acts button').evaluate_all('(xs)=>xs.length===4&&xs.every(e=>e.getBoundingClientRect().height>=44&&getComputedStyle(e).whiteSpace==="nowrap")')
   entry=page.locator('.cqreb-entry')
   assert entry.bounding_box()['height']>=44
   entry.click();page.wait_for_timeout(500)
   assert page.locator('#modal').is_visible()
   page.screenshot(path=OUT+'/'+tag+'_rebirth_locked.png')
   bounds=page.locator('#modal button').evaluate_all('(xs)=>xs.map(e=>({height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width,wrap:getComputedStyle(e).whiteSpace}))')
   assert all(b['height']>=44 and b['width']>=44 and b['wrap']=='nowrap' for b in bounds),bounds
   page.mouse.click(3,3);assert page.evaluate("document.querySelector('#modal').classList.contains('hide')")
   page.evaluate('S.lvl=60;S.xp=xpNeed(60);S.rebXp=cqRebNeed(S.reb||0);calc();render();CQSys.rebirthUI()')
   assert page.evaluate('cqPg.topData().xp===100&&CQ.Host.role().xpPct===100')
   page.locator('#modal').get_by_role('button',name='转生',exact=True).click()
   assert page.evaluate('cqPg.topData().xp===0&&CQ.Host.role().xpPct===0')
   assert page.evaluate('S.reb===1&&S.lvl===60&&S.atb.ene>=1&&S.atb.vit>=1&&!S.sp&&!S.kp')
   page.wait_for_timeout(500)
   page.screenshot(path=OUT+'/'+tag+'_rebirth_done.png')
   assert page.evaluate('document.documentElement.scrollWidth<=390')
   assert page.locator('#modal button').evaluate_all('(xs)=>xs.every(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=844})')
   page.evaluate("closeM();TAB='eg';cqPg.fl('more');EGT='para';render()")
   assert '60级后经验进入转生条' in page.locator('#panel').inner_text()
   assert '可分配' not in page.locator('#panel').inner_text()
   assert page.get_by_role('button',name='查看转生',exact=True).bounding_box()['height']>=44
   page.screenshot(path=OUT+'/'+tag+'_rebirth_page.png')
   assert not errors,errors
   results.append({'browser':engine,'legacy':legacy,'passed':True,'buttons':bounds})
   context.close()
  browser.close()
server.shutdown()
open(OUT+'/report.json','w').write(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps(results,ensure_ascii=False))
