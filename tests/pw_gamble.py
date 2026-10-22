"""Bounded R07 smoke: Chromium/WebKit, new/legacy, 390x844."""
import os,json
from playwright.sync_api import sync_playwright
from pw_baseline import start_server
OUT='/workspace/design/laoyang_m1_shots/codex_gamble'
os.makedirs(OUT,exist_ok=True)
srv,base=start_server()
reports=[]
with sync_playwright() as pw:
 for engine in ['chromium','webkit']:
  browser=getattr(pw,engine).launch()
  for legacy in [False,True]:
   ctx=browser.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block')
   ctx.add_init_script('window.__NOUI=1;window.__NOSHOWLOGIN=1;')
   ctx.route('https://**/*',lambda r:r.abort())
   pg=ctx.new_page(); errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
   pg.goto(base+'/index.html',wait_until='load')
   pg.evaluate("""()=>{CQSys.createChar('赌石验收','zs');S.gold=1e7;S.bag=[];if(window.PWRF)PWRF.stopped=1;}""")
   if legacy: pg.evaluate("delete S.cqGamble;save();load();")
   pg.evaluate("for(let i=0;i<12;i++)CQGamble.receive('zuma','ring');CQGamble.open()")
   pg.locator('[data-n="10"]').click()
   pg.wait_for_timeout(650)
   checks=pg.evaluate("""()=>({cards:document.querySelectorAll('.cg-card').length,total:CQGamble.state().last.length,overflow:document.querySelector('#cq-gamble section').getBoundingClientRect().right>390,small:[...document.querySelectorAll('#cq-gamble button')].some(b=>b.getBoundingClientRect().height<44),animations:document.querySelector('#cq-gamble').getAnimations({subtree:true}).length})""")
   assert checks==dict(cards=9,total=10,overflow=False,small=False,animations=0),checks
   path=f'{OUT}/{engine}_{"legacy" if legacy else "new"}.png';pg.screenshot(path=path)
   pg.locator('#cq-gamble').click(position={'x':2,'y':2});assert pg.locator('#cq-gamble').count()==0
   assert not errors,errors
   reports.append(dict(browser=engine,legacy=legacy,checks=checks,screenshot=path,errors=errors));ctx.close()
  browser.close()
srv.shutdown()
open(OUT+'/report.json','w').write(json.dumps(reports,ensure_ascii=False,indent=2))
print('R07 Playwright: 4 combinations passed')
