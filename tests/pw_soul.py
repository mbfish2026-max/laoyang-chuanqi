import sys,os,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import pw_baseline as b
from playwright.sync_api import sync_playwright
srv,url=b.start_server()
out='/workspace/design/laoyang_m1_shots/codex_soul'
with sync_playwright() as p:
 for engine in ['chromium','webkit']:
  browser=getattr(p,engine).launch()
  for legacy in [False,True]:
   ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,device_scale_factor=1)
   ctx.add_init_script('window.__NOSHOWLOGIN=1')
   page=ctx.new_page();page.route('**/*supabase*/**',lambda r:r.abort())
   page.goto(url+'/index.html');page.wait_for_timeout(800)
   page.evaluate('''(legacy)=>{CL_GATE=false;S=newSave();load();CQSys.createChar('器魂验收','zs');S.auto=0;let w=makeBase(BASEM.swdtulong,40);S.eq.weapon=w;w.soulKills=50000;if(legacy){delete w.soulKills;S=JSON.parse(JSON.stringify(S));}calc();CL_GATE=false;document.querySelectorAll('.login-overlay,#loginOverlay,#applock').forEach(e=>e.remove());showItem(S.eq.weapon.uid);}''',legacy)
   page.evaluate('CQSoul.ui(S.eq.weapon.uid)')
   page.wait_for_timeout(400)
   page.screenshot(path=f'{out}/{engine}_{"old" if legacy else "new"}_soul.png')
   assert page.locator('.cqsoul-tabs button').count()==4
   for i in range(4): page.locator('.cqsoul-tabs button').nth(i).click();assert page.locator('[aria-selected="true"]').inner_text()==['初醒','共鸣','天威','终焉'][i]
   assert page.evaluate('''()=>Array.from(document.querySelectorAll('.cqsoul button')).every(e=>e.getBoundingClientRect().height>=44&&e.scrollWidth<=e.clientWidth+2)''')
   page.locator('#modal').click(position={'x':2,'y':2});page.wait_for_timeout(500);assert page.locator('#modal').evaluate('(e)=>e.classList.contains("hide")')
   page.evaluate('''()=>{let w=S.eq.weapon;w.soulKills=999;CQSoul.credit({},w)}''')
   assert page.locator('.cqsoul-flash').count()==1
   page.wait_for_timeout(1700);assert page.locator('.cqsoul-flash').count()==0
   ctx.close()
  browser.close()
srv.shutdown()
print('chromium/webkit × new/old UI PASS')
