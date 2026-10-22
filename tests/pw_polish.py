import sys,os,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import pw_baseline as b
from playwright.sync_api import sync_playwright
out='/workspace/design/laoyang_m1_shots/codex_polish'
os.makedirs(out,exist_ok=True)
srv,base=b.start_server()
with sync_playwright() as pw:
 for bn in ['chromium','webkit']:
  br=getattr(pw,bn).launch()
  for old in [False,True]:
   ctx=br.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block')
   ctx.route('https://*.supabase.co/**', b.Cloud('ok').handle)
   ctx.add_init_script('window.__NOGATE=1;window.__NOSHOWLOGIN=1;localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(b.fake_session()))+')')
   pg=ctx.new_page();pg.goto(base);pg.wait_for_timeout(1500)
   pg.evaluate("CQSys.createChar('验收','zs');closeM();TAB='bag';STV='shared';render()")
   if old:
    pg.evaluate("S.pst=Array.from({length:20},()=>[]);S.pstN=2;ACCT.shared=Array.from({length:20},()=>[]);ACCT.shN=2;save()")
    pg.reload();pg.wait_for_timeout(500);pg.evaluate("closeM();TAB='bag';STV='shared';render()")
   assert pg.evaluate("document.documentElement.scrollWidth") == 390
   assert pg.evaluate("[...document.querySelectorAll('.cqbag button,.cqb-grid .cell')].every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44})")
   print(bn, 'old' if old else 'new', '390x844', flush=True)
   pg.screenshot(path=f'{out}/{bn}_{"old" if old else "new"}_shared.png')
   pg.evaluate("charUI()");pg.wait_for_timeout(400)
   pt=pg.evaluate(b.JS_BACKDROP)
   assert isinstance(pt,list),pt
   pg.mouse.click(*pt);assert pg.evaluate("document.querySelector('#modal').classList.contains('hide')")
   pg.evaluate("PWRF.paused=1;STV='bag';S.bag=Array.from({length:41},()=>genItem(5,{q:3}));BGP=0;render()")
   cell=pg.locator('.cqb-grid .cell').first
   cell.dispatch_event('pointerdown',{'pointerId':1,'clientX':25,'clientY':400,'bubbles':True})
   pg.wait_for_timeout(550)
   pg.wait_for_timeout(250)
   assert pg.evaluate("document.querySelector('.buxbtns').getBoundingClientRect().bottom<=innerHeight")
   assert pg.locator('#modal .buxq').count()==1,'long press quick menu'
   assert pg.evaluate("[...document.querySelectorAll('.buxq button')].every(e=>e.getBoundingClientRect().height>=44&&e.scrollWidth<=e.clientWidth+1)")
   pg.screenshot(path=f'{out}/{bn}_{"old" if old else "new"}_longpress.png')
   pt=pg.evaluate(b.JS_BACKDROP);assert isinstance(pt,list)
   pg.mouse.click(*pt);assert pg.evaluate("document.querySelector('#modal').classList.contains('hide')")
   pg.wait_for_timeout(400)
   pg.evaluate("BUX.lpFired=0;const grid=document.querySelector('.cqb-grid');for(const [name,x] of [['touchstart',300],['touchend',100]]){const e=new Event(name,{bubbles:true});Object.defineProperty(e,name==='touchstart'?'touches':'changedTouches',{value:[{clientX:x,clientY:400}]});grid.dispatchEvent(e)}")
   assert pg.evaluate('BGP')==1,'bag swipe advances page'
   pg.evaluate("cqbTab('shared');cqbPage(0)")
   pg.evaluate("buxPage(document.querySelector('.cqb-grid'),1)")
   assert pg.evaluate('CQ_BAG_UI.page')==1,'stash swipe advances page'
   pg.evaluate("buxPage(document.querySelector('.cqb-grid'),1)")
   assert pg.evaluate('CQ_BAG_UI.page')==1,'last page is clamped'
   pg.evaluate("TAB='fight';render()")
   pg.screenshot(path=f'{out}/{bn}_{"old" if old else "new"}_fight.png')
   ctx.close()
  br.close()
srv.shutdown()
