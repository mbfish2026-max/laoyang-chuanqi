"""R06 短测：双浏览器、新档/旧键存档，390×844。"""
import os,json,re
from pw_baseline import start_server,Cloud,JS_BACKDROP,fake_session
from playwright.sync_api import sync_playwright
OUT='/workspace/design/laoyang_m1_shots/codex_enhance'
os.makedirs(OUT,exist_ok=True)
srv,base=start_server();results=[]
with sync_playwright() as pw:
 for name in ['chromium','webkit']:
  browser=getattr(pw,name).launch()
  for legacy in [False,True]:
   tag=name+('_legacy' if legacy else '_new');ctx=browser.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block');ctx.route(re.compile(r'https://[a-z0-9]+\.supabase\.co/.*'),Cloud('ok').handle)
   ctx.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(fake_session()))+')');pg=ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
   pg.goto(base+'/index.html');pg.wait_for_timeout(3500)
   pg.evaluate("""()=>{CQSys.createChar('强化验收','zs');S.auto=0;S.cqAE={on:0,max:3,keep:0};S.lvl=60;S.gold=1e8;calc();var a=genItem(1,{base:BASEM.shd1,q:1}),b=genItem(1,{base:BASEM.shd1,q:1});S.bag.push(a,b);equip(a.uid,'shield');equip(b.uid,'gloves');S.eq.shield.en=9;S.eq.gloves.en=3;addMat('heitie',100);addMat('heitie15',50);addMat('heitie20',50);addMat('zhuanyi',2);save();closeM()}""")
   if legacy:
    pg.evaluate("()=>{S.sv=5;delete S.eq.shield.en9;save();load();S.auto=0;closeM()}")
   assert pg.evaluate("S.eq.shield.b===S.eq.gloves.b&&SLOTN.gloves==='右手镯'")
   pg.evaluate("TAB='hero';render();closeM()")
   pg.screenshot(path=f'{OUT}/{tag}_bracelets.png')
   pg.evaluate("showItem(S.bag.find(it=>!it.k&&cqBrace(BASEM[it.b])).uid)");assert pg.locator('#modal button').filter(has_text='穿左手镯').count()==1;assert pg.locator('#modal button').filter(has_text='穿右手镯').count()==1
   pg.locator('#modal button').filter(has_text='穿右手镯').scroll_into_view_if_needed();pg.screenshot(path=f'{OUT}/{tag}_wear.png');pg.evaluate('closeM()')
   pg.evaluate("cqEnhUI(S.eq.gloves.uid)");pg.locator('.cqore').select_option('heitie20')
   assert '75%' in pg.locator('#modal').inner_text()
   buttons=pg.locator('#modal .cqenh button').evaluate_all('(bs)=>bs.map(b=>({h:b.getBoundingClientRect().height,w:b.getBoundingClientRect().width,wrap:getComputedStyle(b).whiteSpace}))')
   assert all(b['h']>=44 and b['w']>=44 and b['wrap']=='nowrap' for b in buttons),buttons
   assert pg.evaluate('document.documentElement.scrollWidth<=390')
   pg.screenshot(path=f'{OUT}/{tag}_enhance.png')
   pg.wait_for_timeout(350);bd=pg.evaluate(JS_BACKDROP);assert isinstance(bd,list);pg.mouse.click(*bd);assert pg.locator('#modal').evaluate("e=>e.classList.contains('hide')")
   pg.evaluate('cqEnhTransferUI(S.eq.shield.uid)');pg.screenshot(path=f'{OUT}/{tag}_transfer.png')
   pg.locator('.cqtransfer').first.click();assert pg.evaluate('S.eq.shield.en===0&&S.eq.gloves.en===8&&matCount("zhuanyi")===1')
   pg.evaluate("S.eq.shield.en=9;TAB='fight';render();goZone(S.zone)");assert pg.locator('.cqen9entry').count()==1
   pg.screenshot(path=f'{OUT}/{tag}_entry.png');pg.wait_for_timeout(1400);assert pg.locator('.cqen9entry').count()==0
   pg.evaluate('render();calc()');assert pg.locator('.cqen9entry').count()==0
   assert not errors,errors
   results.append({'case':tag,'pass':True,'buttons':buttons,'errors':errors});ctx.close()
  browser.close()
srv.shutdown()
open(f'{OUT}/report.json','w').write(json.dumps(results,ensure_ascii=False,indent=2))
print('R06: 4 browser/save cases passed; screenshots:',OUT)
