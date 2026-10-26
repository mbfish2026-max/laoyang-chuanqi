"""Independent browser acceptance; no product source writes. Requires Python Playwright."""
import functools,http.server,threading,json,pathlib,re
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path('/workspace/design/laoyang_m1_shots/codex_compare');OUT.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
BAD='暗夜|暗黑|符文|护身符|炼金|凹槽|暗金|威能|虚隙|秘径|纪元|佣兵|抗性|吸血|魔法物品|技能点|属性点|亡灵'
results=[]
with sync_playwright() as pw:
 for engine in ['chromium','webkit']:
  browser=getattr(pw,engine).launch()
  for old in [False,True]:
   row={'engine':engine,'save':'old' if old else 'new','shots':[],'checks':[],'pageErrors':[]}
   ctx=browser.new_context(viewport={'width':390,'height':844},service_workers='block',is_mobile=True,has_touch=True)
   ctx.add_init_script('window.__NOSHOWLOGIN=1;window.__NOGATE=1;Math.random=(()=>{let s=20261026;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}})();')
   page=ctx.new_page();page.on('pageerror',lambda e:row['pageErrors'].append(str(e)))
   page.route('**/*',lambda r:r.continue_() if r.request.url.startswith(f'http://127.0.0.1:{srv.server_port}/') else r.abort())
   try:
    page.goto(f'http://127.0.0.1:{srv.server_port}/index.html');page.wait_for_timeout(500)
    page.evaluate('''()=>{load();CQSys.createChar('独立验收','zs');S.lvl=60;S.auto=0;S.autoEq=0;S.eq={};S.bag=[];S.pst=[[]];var h=CQSys.hero();h.cls='fs';h.lvl=60;h.eq={};var ringbase=BASES.find(b=>b.s==='ring'&&!b.ccls);window.qaItem=genItem(60,{base:ringbase,q:3});qaItem.req=1;qaItem.m.life=500;var weak=JSON.parse(JSON.stringify(qaItem));weak.uid=91001;weak.m.life=10;var strong=JSON.parse(JSON.stringify(qaItem));strong.uid=91002;strong.m.life=1000;S.eq.ring1=strong;S.eq.ring2=weak;h.eq.ring1=JSON.parse(JSON.stringify(strong));h.eq.ring2=JSON.parse(JSON.stringify(weak));S.bag=[qaItem];var st=JSON.parse(JSON.stringify(qaItem));st.uid=91003;S.pst[0]=[st];}''')
    if old:
     page.evaluate('''()=>{delete S.sv;for(var it of [S.bag[0],...Object.values(S.eq),...S.pst[0],...Object.values(S.hero.eq)]){delete it.cqVersion;delete it.cqCleanVersion;it.m.ll=3;it.name='暗金符文旧装备';}GS.setItem(KEY,JSON.stringify(S));GS.setItem(CH_PRE+ACCT.cur,JSON.stringify(S));load();window.qaItem=S.bag[0];}''')
     row['checks'].append({'migration':page.evaluate('S.bag[0].cqMigrated===1')})
    page.evaluate("()=>{window.__NOUI=0;window.__NOGATE=1;CL_GATE=0;CU={id:'independent-local'};LF.placeholder=0;calc();TAB='bag';STV='bag';closeM();render()}")
    for scene in ['bag','stash','compare','hero_candidates','hero_compare']:
     page.evaluate("closeM();CL_GATE=0;LF.placeholder=0")
     if scene=='stash':page.evaluate("STV='pst';render()")
     elif scene=='compare':page.evaluate('showItem(qaItem.uid)')
     elif scene=='hero_candidates':page.evaluate("cqHeroPage.equip('ring2')")
     elif scene=='hero_compare':page.evaluate("CQCompare.hero(qaItem.uid,'ring2')")
     page.wait_for_timeout(500)
     name=f'{engine}_{row["save"]}_{scene}_390x844.png';page.screenshot(path=str(OUT/name),full_page=True);row['shots'].append(name)
     metrics=page.evaluate('''()=>{var visible=e=>{var r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&!e.closest('.hide')};var area=document.querySelector('#modal:not(.hide)')||document;return {arrows:area.querySelectorAll('.cqup').length,power:[...area.querySelectorAll('.cqpower')].map(e=>e.textContent),buttons:[...area.querySelectorAll('button')].filter(visible).map(e=>{var r=e.getBoundingClientRect(),s=getComputedStyle(e);return {text:e.innerText,w:r.width,h:r.height,nowrap:s.whiteSpace==='nowrap',scroll:e.scrollWidth,client:e.clientWidth,wrapped:(()=>{var t=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());return t.some(n=>{var range=document.createRange();range.selectNodeContents(n);return range.getClientRects().length>1})})()}}),body:document.body.innerText,delta:CQCompare.compare(qaItem,document.querySelector('#modal h3')?.textContent.startsWith('英雄')?S.hero.eq:S.eq).delta,eligible:CQCompare.compare(qaItem,document.querySelector('#modal h3')?.textContent.startsWith('英雄')?S.hero.eq:S.eq).eligible}}''')
     hits=re.findall(BAD,metrics.pop('body'));small=[b for b in metrics['buttons'] if b['w']<44 or b['h']<44];wrapped=[b for b in metrics['buttons'] if b['wrapped']]
     row['checks'].append({'scene':scene,'vocabularyHits':hits,'smallTargets':small,'possibleWrap':wrapped,'metrics':metrics,'deltaAgreement':(metrics['delta']>0 and metrics['eligible'] and any(f'↑ +{metrics["delta"]}' in t for t in metrics['power'])) if scene in ['compare','hero_compare'] else None})
     if scene in ['compare','hero_compare']:
      target=page.evaluate("document.elementFromPoint(2,2).outerHTML.slice(0,250)");page.mouse.click(2,2);page.wait_for_timeout(400);row['checks'].append({'scene':scene,'blankTarget':target,'blankClose':page.locator('#modal').evaluate("e=>e.classList.contains('hide')")})
   except Exception as e:row['error']=str(e)
   results.append(row);ctx.close()
  browser.close()
srv.shutdown();(OUT/'browser_results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(results,ensure_ascii=False,indent=2))
failed=[]
for row in results:
 if row.get('error') or row['pageErrors']:failed.append((row['engine'],row['save'],'browser error'))
 if len(row['shots'])!=5:failed.append((row['engine'],row['save'],'incomplete scenes'))
 for check in row['checks']:
  if check.get('vocabularyHits') or check.get('smallTargets') or check.get('possibleWrap') or check.get('blankClose') is False or check.get('migration') is False or check.get('deltaAgreement') is False:failed.append((row['engine'],row['save'],check))
  if check.get('scene') in ['bag','stash','hero_candidates'] and check.get('metrics',{}).get('arrows',0)<1:failed.append((row['engine'],row['save'],'missing arrow'))
print('BROWSER FAILURES:',json.dumps(failed,ensure_ascii=False))
raise SystemExit(bool(failed))
