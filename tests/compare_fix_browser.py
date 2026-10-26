"""390x844 offline comparison regression, Chromium and WebKit."""
import functools,http.server,threading,pathlib,re,json
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{srv.server_port}'
results=[]
with sync_playwright() as pw:
 for name in ['chromium','webkit']:
  browser=getattr(pw,name).launch()
  ctx=browser.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block')
  ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
  pg=ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  pg.goto(base+'/index.html');pg.wait_for_timeout(600)
  pg.evaluate("""()=>{cloudBoot=async()=>{};CU=null;CL_GATE=0;window.__NOGATE=1;loop0=()=>{};step=()=>{};CQSys.createChar('对比验收','zs');S.auto=0;MON=[];S.lvl=60;S.gold=1e9;S.eq={};S.bag=[];var a=genItem(60,{base:BASEM.swd1,q:3});a.req=1;a.cqBest={maxdmg:5};a.m.maxdmg=5;S.bag.push(a);window.testUID=a.uid;var ring=genItem(60,{base:BASES.find(b=>b.s==='ring'&&!b.ccls),q:3});ring.req=1;S.bag.push(ring);window.ringUID=ring.uid;var h=CQSys.hero();h.cls='fs';h.lvl=60;h.eq={};closeM();TAB='bag';render();calc()}""")
  def check_detail(job):
   pg.evaluate(job)
   assert pg.locator('#modal .cqcompare').count()==1,job
   assert '空槽' in pg.locator('#modal').inner_text(),job
   assert not re.search('暗夜|暗黑|符文|护身符|炼金|凹槽|暗金|威能|虚隙|秘径|纪元|佣兵|抗性|吸血|魔法物品|技能点|属性点|亡灵',pg.locator('#modal').inner_text())
   assert pg.evaluate("[...document.querySelectorAll('#modal button')].every(b=>b.getBoundingClientRect().height>=44&&b.getBoundingClientRect().width>=44)"),job
   assert pg.evaluate("document.querySelector('#modal .mb').getBoundingClientRect().right<=390"),job
  check_detail('showItem(testUID)')
  assert pg.locator('.cqbest.full').count()==1
  assert pg.evaluate("new Set([...document.querySelectorAll('#modal .cqb-detail-actions button')].map(b=>Math.round(b.getBoundingClientRect().top))).size===1")
  pg.screenshot(path=f'/tmp/compare_fix_{name}.png')
  pg.wait_for_timeout(350);pg.mouse.click(2,2);assert not pg.locator('#modal').is_visible()
  assert pg.locator('#panel .cqup').count()>=1
  assert pg.evaluate("getComputedStyle(document.querySelector('.cqup')).pointerEvents==='none'")
  pg.evaluate("S.bag.find(x=>x.uid===testUID).req=50;S.lvl=1;render()")
  assert not pg.evaluate("CQCompare.compare(S.bag.find(x=>x.uid===testUID)).better")
  pg.evaluate("S.lvl=60;S.bag.find(x=>x.uid===testUID).req=1;render()")
  pg.evaluate("toggleLock(testUID)");assert pg.locator('#modal button[onclick^=cqbRecycle]').is_disabled()
  pg.evaluate("toggleLock(testUID);closeM();depositUid(testUID,'p')")
  check_detail('showItem(testUID)')
  pg.evaluate('closeM();withdrawUid(testUID)');pg.evaluate("testUID=S.bag.find(x=>BASEM[x.b]?.s==='weapon').uid")
  pg.evaluate("depositUid(testUID,'s');testUID=ACCT.shared.flat().find(x=>BASEM[x.b]?.s==='weapon').uid")
  check_detail('showItem(testUID)')
  pg.evaluate("closeM();withdrawUid(testUID);testUID=S.bag.find(x=>BASEM[x.b]?.s==='weapon').uid;cqHeroPage.equip('ring1')")
  assert pg.locator('#modal .cqcandidate .cqup').count()==1
  pg.evaluate("CQSys.hero().lvl=1;S.bag.find(x=>x.uid===ringUID).req=50;CQSys.emit('hero')")
  assert pg.locator('#modal .cqcandidate .cqup').count()==0
  pg.evaluate("CQSys.hero().lvl=60;S.bag.find(x=>x.uid===ringUID).req=1;CQSys.emit('hero')")
  assert pg.locator('#modal .cqcandidate .cqup').count()==1
  check_detail("CQCompare.hero(ringUID,'ring1')")
  assert pg.locator('#modal .cqcompare section').count()==2
  pg.evaluate("cqHeroPage.wear(ringUID,'ring2')")
  assert pg.evaluate('CQSys.hero().eq.ring2.uid===ringUID')
  pg.evaluate('closeM();S.shop={items:[S.bag.find(x=>x.uid===testUID)]}')
  check_detail('shopPeek(testUID)')
  assert pg.locator('#modal button[onclick^=buyItem]').count()==1
  pg.evaluate('closeM();CQB6.fuseUI()')
  assert pg.locator('#modal button',has_text='装备详情 / 对比').count()>=1
  pg.evaluate("closeM();S.eq.weapon=S.bag.find(x=>x.uid===testUID);S.bag=S.bag.filter(x=>x.uid!==testUID);CQB6.refineUI()")
  assert pg.locator('#modal button',has_text='装备详情 / 对比').count()==1
  pg.evaluate('closeM();rfMain(testUID)');assert pg.locator('#modal .cqcompare').count()==1
  pg.evaluate("closeM();CQGamble.receive('basic','weapon');CQGamble.identify(1,()=>0);CQGamble.open(true)")
  assert pg.locator('#cq-gamble .cg-card button').count()==1
  pg.locator('#cq-gamble .cg-card button').click()
  assert pg.locator('#modal .cqcompare').count()==1
  assert not errors,errors
  results.append({'browser':name,'checks':'passed','errors':errors})
  browser.close()
srv.shutdown()
print(json.dumps(results,ensure_ascii=False))
