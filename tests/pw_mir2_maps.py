"""Block 3: actual integrated runtime; Chromium/WebKit, 390x844, real new/legacy reloads."""
import json,os,re,sys,subprocess,tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright
import pw_baseline as base
OUT=Path('/workspace/design/laoyang_m1_shots/codex_mir2_int1/map')
ROOT=Path(base.REPO)
def main():
 OUT.mkdir(parents=True,exist_ok=True);srv,url=base.start_server();report=[]
 try:
  with sync_playwright() as pw:
   for engine in ['chromium','webkit']:
    browser=getattr(pw,engine).launch()
    for kind in ['new','legacy']:
     ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,service_workers='block')
     ctx.route('https://*.supabase.co/**',base.Cloud('ok').handle)
     ctx.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(base.fake_session()))+')')
     p=ctx.new_page();errors=[];bad=[]
     p.on('pageerror',lambda e:errors.append(str(e)))
     p.on('response',lambda r:bad.append(r.url) if r.status>=400 and '/assets/cq/' in r.url else None)
     def ready():
      p.wait_for_function("typeof CL!=='undefined'&&CL.ready&&window.cqPg&&window.CQ&&CQ.Host",timeout=30000)
      p.wait_for_function('CQMir2Maps.installUI.done===1',timeout=30000);p.wait_for_timeout(400)
     p.goto(url+'/index.html');ready()
     p.evaluate("CQSys.createChar('地图验收','zs');closeM();S.auto=0;save()")
     assert p.evaluate('S.mir2Mig.maps===1')
     if kind=='legacy':
      p.evaluate("""()=>{delete S.mir2Mig;S.act=4;S.zone=18;S.diff=0;S.unl=18;S.wave=1;S.cleared={2:1,3:1,18:1};S.CL={'0_4':S.cleared,'1_2':{5:1}};S.UN={'0_4':18,'1_2':5};S.ZN={'0_4':18,'1_2':5};S.Q={0:{q6:1,a2q6:1,a3q6:1,a4q3:1,a5q6:1},1:{a3q6:1}};S.q=S.Q[0];S.actU={0:4,1:3};S.diffU=1;const raw=JSON.stringify(S);GS.setItem(KEY,raw);GS.setItem(CH_PRE+ACCT.cur,raw)}""")
     p.reload();ready();p.evaluate('closeM()')
     if kind=='legacy':
      assert p.evaluate("ACTS[S.act].zones[S.zone].id==='cqchiyuelair'&&S.CL['1_3'][15]===1&&S.Q[0].a4q6===1&&S.mir2Mig.maps===1")
      p.evaluate('window._once=JSON.stringify(S);window._twice=JSON.stringify(CQMir2Maps.migrate(S))')
      assert p.evaluate('_once===_twice')
     # Character progression is raised solely to view all locked artwork in the test.
     p.evaluate("window.step=()=>{};S.lvl=60;S.auto=0;S.diff=0;S.diffU=2;S.actU={0:6,1:6,2:6};for(let a=0;a<7;a++)S.UN['0_'+a]=ACTS[a].zones.length-1;S.unl=ACTS[S.act].zones.length-1;calc();H.life=ST.life;H.mana=ST.mana;MON=[];closeM()")
     count=0
     def shot(tag):
      nonlocal count
      p.wait_for_timeout(220)
      assert p.evaluate('document.documentElement.scrollWidth<=390')
      p.screenshot(path=str(OUT/f'{engine}_{kind}_{tag}.png'));count+=1
     for a in range(3,7):
      p.evaluate('(a)=>{TAB="map";MAPD=0;render();CQMir2Maps.show(a)}',a)
      assert p.locator('.mir2map h3').inner_text()==p.evaluate(f'ACTS[{a}].n')
      buttons=p.locator('.mir2map button')
      assert buttons.evaluate_all('(es)=>es.every(e=>{let r=e.getBoundingClientRect();return r.width>=44&&r.height>=44&&getComputedStyle(e).whiteSpace==="nowrap"})')
      shot(f'chapter{a+1}_map')
      p.evaluate('(a)=>CQMir2Maps.preview(a,0,0)',a);shot(f'chapter{a+1}_preview')
      bd=p.evaluate(base.JS_BACKDROP);assert isinstance(bd,list);p.mouse.click(*bd)
      assert p.locator('#modal').evaluate("e=>e.classList.contains('hide')")
      p.evaluate('(a)=>{goAct(a,0,1);S.unl=ACTS[a].zones.length-1;goZone(0);TAB="fight";MON=[];S.wave=0;spawnWave();render()}',a)
      p.wait_for_function('a=>document.querySelector(".cqb .field")?.dataset.mir2===CQMir2Maps.chapters.find(c=>c.act===a).bg',arg=a)
      shot(f'chapter{a+1}_battle')
     bosses=p.evaluate('CQMir2Maps.bossKeys')
     for key in bosses:
      p.evaluate("""key=>{let r=CQSys.bossRt(key);goAct(r.act,0,1);S.unl=ACTS[r.act].zones.length-1;goZone(r.zone);S.wave=ACTS[r.act].zones[r.zone].w-1;S.bossRt={};const m=mkMon(key,ACTS[r.act].zones[r.zone].ml);m.qb=1;MON=[m];TAB='fight';render();CQSys.bossTick()}""",key)
      p.wait_for_function('key=>!!document.querySelector(`img.fig[src$="mdl_mst_${key}.png"]`) && [...document.querySelectorAll("img.fig")].every(i=>i.complete&&i.naturalWidth>0)',arg=key)
      shot('boss_'+key)
     assert not bad,bad
     errors=[e for e in errors if 'supabase.co' not in e and 'access control' not in e]
     assert not errors,errors
     report.append({'browser':engine,'save':kind,'screenshots':count,'bosses':len(bosses),'pass':True})
     print(engine,kind,'PASS',count,'screenshots',flush=True);ctx.close()
    browser.close()
 finally:srv.shutdown()
 (OUT/'ui_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print('PASS',sum(r['screenshots'] for r in report),'screenshots')
def node_suite():
 OUT.mkdir(parents=True,exist_ok=True);results=[];syntax=[]
 for f in sorted(ROOT.rglob('*.js')):
  if 'node_modules' in f.parts or '.git' in f.parts:continue
  r=subprocess.run(['node','--check',str(f)],cwd=ROOT,capture_output=True,text=True);syntax.append({'test':str(f.relative_to(ROOT)),'code':r.returncode,'output':r.stdout+r.stderr})
 for f in sorted(ROOT.glob('tests/*_test.js'))+[ROOT/'cq/cq_battle_test.js']:
  r=subprocess.run(['node',str(f)],cwd=ROOT,capture_output=True,text=True)
  row={'test':str(f.relative_to(ROOT)),'code':r.returncode,'output':r.stdout+r.stderr};results.append(row)
  print(row['test'],r.returncode,flush=True)
 (OUT/'node_results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
 (OUT/'syntax_results.json').write_text(json.dumps(syntax,ensure_ascii=False,indent=2))
 if any(r['code'] for r in results+syntax):
  for r in results+syntax:
   if r['code']:print(r['test'],r['output'])
  raise SystemExit(1)
 print('PASS',len(results),'Node commands; integrated runtime')
if __name__=='__main__':
 if '--node-suite' in sys.argv:node_suite()
 else:main()
