"""Local offline UI regression; run with python3, no cloud credentials required."""
import functools,http.server,threading,pathlib,json,re,subprocess
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path('/workspace/design/laoyang_m1_shots/codex_diablo_clean');OUT.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=srv.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{srv.server_port}/';results=[]
fixture=subprocess.check_output(['node','-e',"process.stdout.write(require('./tests/diablo_clean_save_fixture'))"],cwd=ROOT,text=True)
words=re.compile('暗夜|暗黑|符文|护身符|炼金|凹槽|暗金|威能|虚隙|秘径|纪元|佣兵|抗性|吸血|魔法物品|技能点|属性点|亡灵|necromancer',re.I)
jobs=[('role',"TAB='hero';render()"),('role_detail',"TAB='hero';render();document.querySelector('#panel').scrollTop=10000"),('bag',"TAB='bag';render()"),('shop',"TAB='shop';SHT='gam';render()"),('reforge',"SHT='rf';render()"),('ach',"TAB='eg';cqPg.fl('ach')"),('codex',"EG_ACV='cx';cqPg.fl('ach')"),('bounty',"S.actU[0]=1;cqPg.fl('bounty')"),('more',"cqPg.fl('more')"),('settings',"setUI()"),('worldboss_event',"ACTS.forEach(a=>S.Q[0][a.fq]=1);cqPg.fl('event')")]
try:
 with sync_playwright() as p:
  for name in ['chromium','webkit']:
   try:b=getattr(p,name).launch()
   except Exception as e:results.append(dict(browser=name,error=str(e)));continue
   for kind in ['new','old']:
    c=b.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block');c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
    pg=c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));row=dict(browser=name,save=kind,pages=[],pageerrors=errs);results.append(row)
    def blank_click():
     pg.wait_for_timeout(400) # bagux intentionally ignores backdrop during first 300 ms
     point=pg.evaluate('''()=>{for(let y=2;y<844;y+=8)for(let x of [2,10,380,388,195]){let e=document.elementFromPoint(x,y);if(e&&e.id==='modal')return {x,y};}return null}''')
     if point:pg.mouse.click(point['x'],point['y']);pg.wait_for_timeout(180)
     return {'point':point,'closed':not pg.locator('#modal').is_visible(),'gate':pg.evaluate('CL_GATE'),'handler':pg.evaluate("!!document.querySelector('#modal').onclick")}
    try:
     pg.goto(base+'index.html');pg.wait_for_timeout(800)
     pg.evaluate("cloudBoot=async()=>{};CU=null;CL_GATE=0;window.__NOGATE=1;loop0=()=>{};window.step=()=>{};CQSys.createChar('本地验收','zs');S.auto=0;MON=[];closeM();calc();")
     if kind=='old':pg.evaluate(fixture)
     pg.evaluate("S.auto=0;MON=[];S.actU=S.actU||{};closeM();calc();")
     for label,js in jobs:
      r=dict(page=label);row['pages'].append(r)
      try:
       pg.evaluate('closeM();'+js);pg.wait_for_timeout(120)
       r['text']=pg.locator('body').inner_text();r['hits']=words.findall(r['text'].replace('暗黑战士',''));r['compensation']=[l for l in r['text'].splitlines() if re.search('旧版.*已折算',l)]
       r['buttons']=pg.locator('button').evaluate_all('''es=>es.filter(b=>{let r=b.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(b).visibility!=="hidden"}).map(b=>{let r=b.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(b);let tops=[];let w=document.createTreeWalker(b,NodeFilter.SHOW_TEXT);while(w.nextNode()){let n=w.currentNode;if(!n.textContent.trim())continue;let rr=document.createRange();rr.selectNodeContents(n);for(let q of rr.getClientRects())if(q.width&&q.height)tops.push(Math.round(q.top));}let lines=[...new Set(tops)];return {text:b.innerText,height:r.height,width:r.width,lines:lines.length,disabled:b.disabled,primary:b.matches('.gold,.cqbtn,.btn')};})''')
       r['wrapped']=[x for x in r['buttons'] if x['lines']>1];r['smallPrimary']=[x for x in r['buttons'] if x['primary'] and not x['disabled'] and (x['height']<44 or x['width']<44)]
       r['screenshot']=f'{name}_{kind}_{label}.png';pg.screenshot(path=str(OUT/r['screenshot']))
       if pg.locator('#modal').is_visible():
        r['blankAudit']=blank_click();r['blankClose']=r['blankAudit']['closed']
      except Exception as e:r['error']=str(e)
     pg.evaluate('setUI()');row['settingsBlankAudit']=blank_click();row['settingsBlankClose']=row['settingsBlankAudit']['closed']
    except Exception as e:row['error']=str(e)
    c.close()
   b.close()
finally:
 srv.shutdown();(OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps([{**{k:v for k,v in r.items() if k!='pages'},'pages':[{k:v for k,v in q.items() if k not in ['text','buttons']} for q in r.get('pages',[])]} for r in results],ensure_ascii=False))

assert len(results)==4 and all(len(r.get('pages',[]))==11 for r in results), 'browser coverage incomplete'
assert all(not r.get('error') and not r['pageerrors'] for r in results), 'browser errors'
assert all(not q.get('error') and not q['hits'] for r in results for q in r['pages']), 'retired vocabulary or page error'
assert all(not q['wrapped'] for r in results for q in r['pages']), 'wrapped button label'
assert all(r['settingsBlankClose'] and all(q.get('blankClose',True) for q in r['pages']) for r in results), 'backdrop close'
assert all(not q['smallPrimary'] for r in results for q in r['pages']), 'primary touch target below 44 x 44'
