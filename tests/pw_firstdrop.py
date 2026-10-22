"""R08: 390x844, Chromium/WebKit, fresh and legacy-shaped saves; local cloud mock."""
import os, sys, re, json
sys.path.insert(0,os.path.dirname(__file__))
from pw_baseline import start_server, Cloud, fake_session, JS_BACKDROP
from playwright.sync_api import sync_playwright
OUT='/workspace/design/laoyang_m1_shots/codex_firstdrop'
os.makedirs(OUT,exist_ok=True)
srv,base=start_server()
report=[]
try:
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch()
   for old in [False,True]:
    ctx=browser.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block')
    cloud=Cloud('ok');ctx.route(re.compile(r'https://[a-z0-9]+\.supabase\.co/.*'),cloud.handle)
    ctx.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(fake_session()))+')')
    pg=ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.goto(base+'/index.html');pg.wait_for_timeout(3500)
    pg.evaluate("""old=>{CQSys.createChar(old?'旧档侠客':'首爆少侠','zs');S.auto=0;if(old){S.lvl=38;delete S.cqFirstdrop;save();load()}closeM();TAB='map';render()}""",old)
    pg.locator('.cqfd-entry button').click()
    for tab in ['lv','power','drop']:
     pg.evaluate('(t)=>CQFirstdrop.ui(t)',tab)
     assert pg.locator('.cqfd-list>div').count()==121
     assert pg.evaluate('document.documentElement.scrollWidth<=390')
     assert pg.evaluate("[...document.querySelectorAll('.cqfd button')].every(e=>e.getBoundingClientRect().height>=44&&getComputedStyle(e).whiteSpace==='nowrap')")
     pg.screenshot(path=f'{OUT}/{engine}_{"old" if old else "new"}_{tab}.png')
    bd=pg.evaluate(JS_BACKDROP);assert isinstance(bd,list);pg.mouse.click(*bd);pg.wait_for_timeout(250)
    assert pg.locator('#modal').evaluate("e=>e.classList.contains('hide')")
    pg.evaluate("""()=>{let x=CQFirstdrop.catalog()[0];CQFirstdrop.dropped({q:5,cqContentId:x.id});save();load();CQFirstdrop.ui('drop')}""")
    assert pg.evaluate("matCount('ckq')===1&&CQFirstdrop.bonus()===0.01")
    pg.screenshot(path=f'{OUT}/{engine}_{"old" if old else "new"}_title.png')
    assert not errors, errors
    report.append({'browser':engine,'save':'old' if old else 'new','passed':True})
    ctx.close()
   browser.close()
finally:
 srv.shutdown()
with open(OUT+'/report.json','w') as f:json.dump(report,f,ensure_ascii=False,indent=2)
print(report)
