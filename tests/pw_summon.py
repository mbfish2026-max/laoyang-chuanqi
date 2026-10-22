import sys,os,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import pw_baseline as b
from playwright.sync_api import sync_playwright
out='/workspace/design/laoyang_m1_shots/codex_summon';os.makedirs(out,exist_ok=True);srv,url=b.start_server();results=[]
with sync_playwright() as p:
 for name in ['chromium','webkit']:
  browser=getattr(p,name).launch();ctx=browser.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block');ctx.route('https://*.supabase.co/**',b.Cloud('ok').handle)
  pg=ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  pg.add_init_script('localStorage.setItem("cq_sb_auth",'+json.dumps(json.dumps(b.fake_session()))+');');pg.goto(url);pg.wait_for_timeout(4500)
  for mode in ['new','old']:
   pg.evaluate("""mode=>{closeM();CQSys.createChar('召唤'+mode,'ds');S.lvl=60;S.sk={zhss:7,zhkl:7};calc();H.life=ST.life;H.mana=ST.mana;CLS_TY.pet(SKM.zhss,SV('zhss',7));CQSys.summonSync();if(mode==='old'){save();resetRuntime();load();calc();CQSys.summonSync()}TAB='fight';S.auto=0;render()}""",mode)
   pg.evaluate('CQSys.summonSync();render()');pg.wait_for_timeout(1200);pg.screenshot(path=f'{out}/{name}_{mode}_390x844.png')
   results.append({'browser':name,'mode':mode,'pets':pg.evaluate('S.summons.length'),'linked':pg.evaluate('ALLY.some(a=>a.summonId===S.summons[0].id)'),'errors':errors[:]})
  browser.close()
srv.shutdown();open(out+'/summon_browser_report.json','w').write(json.dumps(results,ensure_ascii=False,indent=2));print(results)

assert all(r['pets'] and r['linked'] and not r['errors'] for r in results), results
