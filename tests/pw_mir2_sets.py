#!/usr/bin/env python3
"""R03 integrated 390x844 new/legacy save UI, using mocked cloud only."""
import os,json,sys
sys.path.insert(0,os.path.dirname(__file__))
from pw_baseline import start_server,Cloud,JS_BACKDROP,fake_session
from playwright.sync_api import sync_playwright
DEST='/workspace/design/laoyang_m1_shots/codex_sets'
os.makedirs(DEST,exist_ok=True)
report=[]
srv,base=start_server()
try:
 with sync_playwright() as pw:
  for name in ['chromium','webkit']:
   browser=getattr(pw,name).launch()
   for mode in ['new','old']:
    ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,service_workers='block')
    ctx.route('https://*.supabase.co/**',Cloud('ok').handle)
    ctx.add_init_script('window.__NOGATE=1;window.__NOSHOWLOGIN=1;localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(fake_session()))+');')
    pg=ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.goto(base+'/index.html');pg.wait_for_function('window.CQMir2Sets&&window.CQSys');pg.wait_for_function("CL.ready");pg.wait_for_function("typeof CU!=='undefined'&&!!CU")
    pg.evaluate("""()=>{CQSys.createChar('套装验收','zs');S.lvl=60;S.auto=0;S.autoEq=0;S.eq={};S.bag=[];for(const p of SETITEMS.filter(p=>p.set==='shengzhan').slice(0,6)){const it=CQMir2Equip.createContent(p.id,60);S.eq[BASEM[it.b].s==='ring'?'ring1':BASEM[it.b].s]=it}calc();closeM()}""")
    if mode=='old':
     pg.evaluate("""()=>{for(const it of Object.values(S.eq)){for(const k of Object.keys(it))if(k.startsWith('cq'))delete it[k];it.m.life=(it.m.life||0)+30;it.en=7;it.lock=1;}delete S.mir2Mig;delete S.mir2Sets;calc();save()}""")
     pg.evaluate('flushNow&&flushNow()');pg.wait_for_timeout(1500)
     before=pg.evaluate('({life:ST.life,power:CQSys.power(),uids:Object.values(S.eq).map(it=>it.uid)})')
     pg.reload();pg.wait_for_function('window.CQMir2Sets&&window.CQSys');pg.wait_for_function("typeof CU!=='undefined'&&!!CU");pg.wait_for_timeout(300)
     after=pg.evaluate('({life:ST.life,power:CQSys.power(),uids:Object.values(S.eq).map(it=>it.uid)})')
     assert after['life']>=before['life'] and after['power']>=before['power'] and after['uids']==before['uids'],(before,after)
    else:before=after=None
    pg.evaluate('closeM();TAB="hero";render();document.querySelector("#toast").classList.remove("on")');pg.wait_for_timeout(350)
    pg.screenshot(path=f'{DEST}/{name}_{mode}_hero.png')
    pg.locator('.mir2-set-entry').click();pg.wait_for_timeout(350)
    assert '烈火剑法追加一次50%' in pg.locator('#modal').inner_text()
    bounds=pg.locator('#modal .mb').bounding_box();assert bounds['y']>=0 and bounds['y']+bounds['height']<=844,bounds
    pg.screenshot(path=f'{DEST}/{name}_{mode}_codex.png')
    pg.locator('#modal .mb').evaluate('e=>e.scrollTop=e.scrollHeight');pg.wait_for_timeout(100)
    pg.screenshot(path=f'{DEST}/{name}_{mode}_codex_endgame.png')
    pg.locator('#modal .mb').evaluate('e=>e.scrollTop=0')
    checks=pg.evaluate("""()=>[...document.querySelectorAll('#modal button')].filter(e=>e.getClientRects().length).map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,nowrap:getComputedStyle(e).whiteSpace==='nowrap'}))""")
    assert all(b['w']>=44 and b['h']>=44 and b['nowrap'] for b in checks),checks
    assert pg.evaluate('document.documentElement.scrollWidth<=390')
    pt=pg.evaluate(JS_BACKDROP);assert isinstance(pt,list),pt
    pg.mouse.click(*pt);assert pg.locator('#modal').evaluate("e=>e.classList.contains('hide')")
    pg.evaluate('showItem(Object.values(S.eq)[0].uid)');pg.wait_for_timeout(100)
    pg.screenshot(path=f'{DEST}/{name}_{mode}_detail.png')
    assert '已穿戴 6 件' in pg.locator('#modal').inner_text()
    errors=[e for e in errors if not ('supabase.co' in e and 'access control' in e)]
    assert not errors,errors
    report.append(dict(browser=name,mode=mode,before=before,after=after,buttons=checks,errors=errors))
    ctx.close()
   browser.close()
finally:
 srv.shutdown()
 with open(DEST+'/report.json','w') as f:json.dump(report,f,ensure_ascii=False,indent=2)
print('sets UI: Chromium/WebKit × new/old PASS')
